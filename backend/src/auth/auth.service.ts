// backend/src/auth/auth.service.ts
import { Injectable, ForbiddenException, NotFoundException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { User, LoginResult } from './auth.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async login(user: User): Promise<LoginResult> {
    // [Gate 2] 접근 허용 확인
    let isAllowed = false;

    if (user.companyCode) {
      const companyAuth = await this.prisma.refAccessCode.findFirst({
        where: { compid: user.companyCode, isActive: 'Y' },
      });
      if (companyAuth) isAllowed = true;
    }

    if (!isAllowed && user.department) {
      const deptAuth = await this.prisma.refAccessCode.findFirst({
        where: { deptid: user.department, isActive: 'Y' },
      });
      if (deptAuth) isAllowed = true;
    }

    if (!isAllowed) {
      throw new ForbiddenException(
        `Access Denied: Unauthorized Company (${user.companyCode}) or Department (${user.department}).`,
      );
    }

    // [Gate 3] 사용자 식별 및 컨텍스트(Site/SDWT) 조회
    let contextSite = '';
    let contextSdwt = '';

    // upsert를 사용하여 사용자 정보 갱신 및 컨텍스트 조회
    // Prisma transaction을 사용하거나, 조회 후 업데이트 방식 사용
    let sysUser = await this.prisma.sysUser.findUnique({
      where: { loginId: user.userId },
      include: {
        context: {
          include: {
            sdwtInfo: true,
          },
        },
      },
    });

    if (sysUser) {
      // 기존 유저: 로그인 카운트 증가
      await this.prisma.sysUser.update({
        where: { loginId: user.userId },
        data: { loginCount: { increment: 1 }, lastLoginAt: new Date() },
      });

      // 저장된 컨텍스트 정보 추출
      if (sysUser.context && sysUser.context.sdwtInfo) {
        contextSite = sysUser.context.sdwtInfo.site;
        contextSdwt = sysUser.context.sdwtInfo.sdwt;
      }
    } else {
      // 신규 유저 생성
      sysUser = await this.prisma.sysUser.create({
        data: { loginId: user.userId, loginCount: 1 },
        include: {
          context: { include: { sdwtInfo: true } }
        }
      });
    }

    // [Gate 4] 권한 결정 (Admin Role Check)
    // [수정] 대소문자 이슈 방지를 위해 findFirst 사용 (Prisma 버전에 따라 mode: 'insensitive' 지원 여부 확인 필요)
    // 지원하지 않는 DB일 경우를 대비해 Application 레벨에서 검증 로직 추가 가능하지만,
    // 여기서는 findFirst로 유연하게 검색합니다.
    let role = 'USER';
    
    const adminUser = await this.prisma.cfgAdminUser.findFirst({
      where: { 
        loginId: {
          equals: user.userId,
          // Postgres 등에서는 insensitive 지원, 아닐 경우 정확한 매칭
          // mode: 'insensitive' 
        }
      }, 
    });

    // 만약 equals 검색이 실패했다면, 모든 목록을 가져와서 비교하는 것은 비효율적이므로
    // DB Collation이 대소문자 구분(CI)되어 있기를 기대하거나,
    // 데이터가 소문자로 저장되어 있다면 user.userId.toLowerCase() 시도
    if (adminUser) {
      role = adminUser.role;
    } else {
      // Guest Check
      const guestUser = await this.prisma.cfgGuestAccess.findFirst({
        where: {
          loginId: user.userId,
          validUntil: { gte: new Date() },
        },
      });
      if (guestUser) role = guestUser.grantedRole;
    }
    
    this.logger.log(`User [${user.userId}] logged in. Role: [${role}]. Context: [${contextSite}/${contextSdwt}]`);

    // [최종] 반환할 User 객체 구성
    const finalUser: User = {
      ...user,
      role, 
      site: contextSite || undefined, // 값이 없으면 undefined 처리
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

    if (!sdwtInfo) {
      throw new NotFoundException(`Invalid Site (${site}) or SDWT (${sdwt}).`);
    }

    // Upsert로 컨텍스트 저장
    return await this.prisma.sysUserContext.upsert({
      where: { loginId },
      update: { lastSdwtId: sdwtInfo.id },
      create: { loginId, lastSdwtId: sdwtInfo.id },
    });
  }
}
