// backend/src/auth/auth.service.ts
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import type { User, LoginResult } from './auth.interface';
import { GuestRequestDto } from './auth.controller';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async login(user: User): Promise<LoginResult> {
    const rawUserId = user.userId;
    this.logger.log(
      `[LOGIN START] Processing login for Raw UserID: '${rawUserId}'`,
    );

    let isWhitelisted = false;

    // 1. Whitelist Check
    try {
      if (user.companyCode) {
        const companyAuth = await this.prisma.refAccessCode.findFirst({
          where: { compid: user.companyCode, isActive: 'Y' },
        });
        if (companyAuth) isWhitelisted = true;
      }

      if (user.department) {
        const deptAuth = await this.prisma.refAccessCode.findFirst({
          where: { deptid: user.department },
        });
        if (deptAuth && !isWhitelisted && deptAuth.isActive === 'Y') {
          isWhitelisted = true;
        }
      }
    } catch (e) {
      this.logger.error(`[Whitelist Check Error] ${e}`);
      // Whitelist 체크 실패해도 Guest 권한 확인으로 넘어감
    }

    // 2. User Sync
    let dbLoginId = rawUserId;
    try {
      const existingUser = await this.prisma.sysUser.findFirst({
        where: { loginId: { equals: rawUserId, mode: 'insensitive' } },
      });

      if (existingUser) {
        dbLoginId = existingUser.loginId;
        await this.prisma.sysUser.update({
          where: { loginId: dbLoginId },
          data: { loginCount: { increment: 1 }, lastLoginAt: new Date() },
        });
      } else {
        const newUser = await this.prisma.sysUser.create({
          data: { loginId: rawUserId, loginCount: 1 },
        });
        dbLoginId = newUser.loginId;
      }
    } catch (e) {
      this.logger.warn(`[User Sync] Error: ${e}. Retrying lookup...`);
      // Sync 실패 시 rawUserId 사용
    }

    // 3. Role & Guest Check
    let role = 'USER';
    let hasGuestAccess = false;

    try {
      const adminUser = await this.prisma.cfgAdminUser.findFirst({
        where: { loginId: { equals: dbLoginId, mode: 'insensitive' } },
      });

      if (adminUser) {
        role = adminUser.role.toUpperCase();
      } else {
        const guestUser = await this.prisma.cfgGuestAccess.findFirst({
          where: {
            loginId: { equals: dbLoginId, mode: 'insensitive' },
            validUntil: { gte: new Date() },
          },
        });
        if (guestUser) {
          role = guestUser.grantedRole.toUpperCase();
          hasGuestAccess = true;
        }
      }
    } catch (e) {
      this.logger.error(`[Role Check Error] ${e}`);
      // DB 에러 시 접속 차단으로 이어질 수 있음
    }

    // 4. Final Access Decision
    const isAdmin = role === 'ADMIN' || role === 'MANAGER';
    const isAllowed = isWhitelisted || isAdmin || hasGuestAccess;

    if (!isAllowed) {
      // 신청 상태 확인
      try {
        const lastRequest = await this.prisma.cfgGuestRequest.findFirst({
          where: { loginId: { equals: dbLoginId, mode: 'insensitive' } },
          orderBy: { createdAt: 'desc' },
        });

        if (lastRequest) {
          if (lastRequest.status === 'PENDING') {
            throw new ForbiddenException('PendingApproval');
          }
          if (lastRequest.status === 'REJECTED') {
            throw new ForbiddenException('Rejected');
          }
        }
      } catch (e) {
        if (e instanceof ForbiddenException) throw e; // PENDING/REJECTED 전파
        this.logger.error(`[Request Check Error] ${e}`);
      }

      throw new ForbiddenException('AccessDenied');
    }

    // 5. Token Issuance
    let contextSite = '';
    let contextSdwt = '';
    try {
      const userContext = await this.prisma.sysUserContext.findFirst({
        where: { loginId: { equals: dbLoginId, mode: 'insensitive' } },
        include: { sdwtInfo: true },
      });
      if (userContext && userContext.sdwtInfo) {
        contextSite = userContext.sdwtInfo.site;
        contextSdwt = userContext.sdwtInfo.sdwt;
      }
    } catch (e) {
      this.logger.warn(`[Context Load Error] ${e}`);
    }

    const finalUser: User = {
      ...user,
      userId: dbLoginId,
      role,
      site: contextSite || undefined,
      sdwt: contextSdwt || undefined,
    };

    const payload = {
      username: finalUser.userId,
      sub: finalUser.userId,
      role: finalUser.role,
      groups: finalUser.groups,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      access_token: accessToken,
      user: finalUser,
    };
  }

  async saveUserContext(loginId: string, site: string, sdwt: string) {
    const sdwtInfo = await this.prisma.refSdwt.findFirst({
      where: { site, sdwt },
    });
    if (!sdwtInfo) throw new NotFoundException(`Invalid Site or SDWT.`);

    const sysUser = await this.prisma.sysUser.findFirst({
      where: { loginId: { equals: loginId, mode: 'insensitive' } },
    });
    const targetLoginId = sysUser ? sysUser.loginId : loginId;

    return await this.prisma.sysUserContext.upsert({
      where: { loginId: targetLoginId },
      update: { lastSdwtId: sdwtInfo.id },
      create: { loginId: targetLoginId, lastSdwtId: sdwtInfo.id },
    });
  }

  async getAccessCodes() {
    return await this.prisma.refAccessCode.findMany({
      orderBy: { updatedAt: 'desc' },
    });
  }

  async createGuestRequest(data: GuestRequestDto) {
    this.logger.log(`[GUEST REQUEST] New request from ${data.loginId}`);

    const existing = await this.prisma.cfgGuestRequest.findFirst({
      where: { loginId: data.loginId, status: 'PENDING' },
    });

    if (existing) {
      return {
        message: '이미 대기 중인 신청 내역이 있습니다.',
        reqId: existing.reqId,
      };
    }

    return this.prisma.cfgGuestRequest.create({
      data: {
        loginId: data.loginId,
        deptCode: data.deptCode,
        deptName: data.deptName,
        reason: data.reason,
        status: 'PENDING',
      },
    });
  }
}
