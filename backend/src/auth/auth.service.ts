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
    const rawUserId = user.userId;
    this.logger.log(`===========================================================`);
    this.logger.log(`[LOGIN START] Processing login for Raw UserID: '${rawUserId}'`);

    // [Gate 2] 접근 허용 확인 (Company / Department Whitelist)
    // + AD 정보로 DB의 이름 정보 현행화 (Auto Update)
    let isAllowed = false;

    // 1. 회사 코드로 확인
    if (user.companyCode) {
      const companyAuth = await this.prisma.refAccessCode.findFirst({
        where: { compid: user.companyCode, isActive: 'Y' },
      });
      if (companyAuth) {
        isAllowed = true;
        
        // [Auto Update] 회사명이 비어있거나 다르면 AD 정보로 업데이트
        if (user.companyName && companyAuth.compName !== user.companyName) {
           await this.prisma.refAccessCode.update({
             where: { compid: companyAuth.compid },
             data: { compName: user.companyName }
           });
           this.logger.log(`[AUTO UPDATE] AccessCode Company Name updated: ${user.companyName}`);
        }
      }
    }

    // 2. 부서 코드로 확인 및 이름 업데이트 (회사 인증 여부와 관계없이 실행)
    if (user.department) {
      // 활성 여부와 상관없이 해당 부서 코드가 Whitelist 테이블에 있는지 조회
      const deptAuth = await this.prisma.refAccessCode.findFirst({
        where: { deptid: user.department },
      });

      if (deptAuth) {
        // [Auto Update] 부서명이 비어있거나 다르면 AD 정보로 업데이트 (DB 현행화)
        if (user.departmentName && deptAuth.deptName !== user.departmentName) {
           await this.prisma.refAccessCode.update({
             where: { compid: deptAuth.compid }, // PK(compid)를 사용하여 업데이트
             data: { deptName: user.departmentName }
           });
           this.logger.log(`[AUTO UPDATE] AccessCode Dept Name updated: ${user.departmentName}`);
        }

        // 아직 권한이 없고(회사체크 실패 또는 스킵), 해당 부서 설정이 활성(Y) 상태라면 접속 허용
        if (!isAllowed && deptAuth.isActive === 'Y') {
          isAllowed = true;
        }
      }
    }

    if (!isAllowed) {
      this.logger.error(`[ACCESS DENIED] Company: ${user.companyCode}, Dept: ${user.department}`);
      throw new ForbiddenException(
        `Access Denied: Unauthorized Company (${user.companyCode}) or Department (${user.department}).`,
      );
    }

    // ---------------------------------------------------------------------------
    // [Step 1] DB ID 동기화 및 식별 (ID 정규화)
    // ---------------------------------------------------------------------------
    let dbLoginId = rawUserId; 

    try {
      const existingUser = await this.prisma.sysUser.findFirst({
        where: { loginId: { equals: rawUserId, mode: 'insensitive' } }
      });

      if (existingUser) {
        dbLoginId = existingUser.loginId; // DB에 저장된 실제 ID 사용
        this.logger.log(`[STEP 1] User Found in DB. Raw: '${rawUserId}' -> Resolved: '${dbLoginId}'`);
        
        await this.prisma.sysUser.update({
          where: { loginId: dbLoginId },
          data: { loginCount: { increment: 1 }, lastLoginAt: new Date() },
        });
      } else {
        this.logger.log(`[STEP 1] New User Detected. Creating: '${rawUserId}'`);
        const newUser = await this.prisma.sysUser.create({
          data: { loginId: rawUserId, loginCount: 1 }
        });
        dbLoginId = newUser.loginId;
      }
    } catch (e) {
      this.logger.warn(`[STEP 1] Error during user sync: ${e}. Retrying lookup...`);
      const retryUser = await this.prisma.sysUser.findFirst({
        where: { loginId: { equals: rawUserId, mode: 'insensitive' } }
      });
      if (retryUser) dbLoginId = retryUser.loginId;
    }

    // ---------------------------------------------------------------------------
    // [Step 2] Admin 권한 부여 확인
    // ---------------------------------------------------------------------------
    let role = 'USER';
    this.logger.log(`[STEP 2] Checking Admin Privileges for ID: '${dbLoginId}'...`);

    const adminUser = await this.prisma.cfgAdminUser.findFirst({
      where: { 
        loginId: { equals: dbLoginId, mode: 'insensitive' }
      }
    });

    if (adminUser) {
      role = adminUser.role.toUpperCase(); 
      this.logger.log(`   ✅ Admin Matched! Role set to: [${role}]`);
    } else {
      // Guest Check
      const guestUser = await this.prisma.cfgGuestAccess.findFirst({
        where: {
          loginId: { equals: dbLoginId, mode: 'insensitive' },
          validUntil: { gte: new Date() },
        },
      });
      if (guestUser) {
        role = guestUser.grantedRole.toUpperCase(); 
        this.logger.log(`   ✅ Guest Access Granted! Role set to: [${role}]`);
      } else {
        this.logger.warn(`   ❌ Admin Not Found in 'cfg_admin_user' for ID: '${dbLoginId}'. Defaulting to USER.`);
      }
    }

    // ---------------------------------------------------------------------------
    // [Step 3] Site/Sdwt Context 정보 확인
    // ---------------------------------------------------------------------------
    let contextSite = '';
    let contextSdwt = '';
    this.logger.log(`[STEP 3] Checking Saved Context for ID: '${dbLoginId}'...`);

    const userContext = await this.prisma.sysUserContext.findFirst({
      where: { 
        loginId: { equals: dbLoginId, mode: 'insensitive' } 
      },
      include: {
        sdwtInfo: true, 
      },
    });

    if (userContext && userContext.sdwtInfo) {
      contextSite = userContext.sdwtInfo.site;
      contextSdwt = userContext.sdwtInfo.sdwt;
      this.logger.log(`   ✅ Context Found: Site=[${contextSite}], SDWT=[${contextSdwt}]`);
    } else {
      this.logger.warn(`   ❌ Context Not Found in 'sys_user_context' for ID: '${dbLoginId}'.`);
    }

    // ---------------------------------------------------------------------------
    // [Final] 최종 결과 반환
    // ---------------------------------------------------------------------------
    this.logger.log(`[LOGIN COMPLETE] Final User State -> ID: ${dbLoginId}, Role: ${role}, Context: ${contextSite}/${contextSdwt}`);
    this.logger.log(`===========================================================`);

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
    this.logger.log(`[SAVE CONTEXT] Request for ${loginId} -> Site: ${site}, SDWT: ${sdwt}`);

    const sdwtInfo = await this.prisma.refSdwt.findFirst({
      where: { site, sdwt },
    });

    if (!sdwtInfo) {
      this.logger.error(`[SAVE CONTEXT] Failed: Invalid Site/SDWT combination.`);
      throw new NotFoundException(`Invalid Site (${site}) or SDWT (${sdwt}).`);
    }

    const sysUser = await this.prisma.sysUser.findFirst({
      where: { loginId: { equals: loginId, mode: 'insensitive' } }
    });
    
    const targetLoginId = sysUser ? sysUser.loginId : loginId;

    const result = await this.prisma.sysUserContext.upsert({
      where: { loginId: targetLoginId },
      update: { lastSdwtId: sdwtInfo.id },
      create: { loginId: targetLoginId, lastSdwtId: sdwtInfo.id },
    });

    this.logger.log(`[SAVE CONTEXT] Success for ${targetLoginId}`);
    return result;
  }

  // [New] 접근 제어 목록 조회 (Admin 화면용)
  async getAccessCodes() {
    return await this.prisma.refAccessCode.findMany({
      orderBy: { updatedAt: 'desc' }
    });
  }
}
