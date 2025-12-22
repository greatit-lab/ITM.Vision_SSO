// backend/src/admin/admin.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  CreateAdminDto,
  CreateAccessCodeDto,
  UpdateAccessCodeDto,
  CreateGuestDto,
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // 1. 시스템 사용자 (sys_user)
  async getAllUsers() {
    return this.prisma.sysUser.findMany({
      include: {
        context: {
          include: { sdwtInfo: true },
        },
      },
      orderBy: { lastLoginAt: 'desc' },
    });
  }

  // 2. 관리자 설정 (cfg_admin_user)
  async getAllAdmins() {
    return this.prisma.cfgAdminUser.findMany({
      orderBy: { assignedAt: 'desc' },
    });
  }

  async addAdmin(data: CreateAdminDto) {
    // 중복 ID 체크 로직 추가 권장 (Prisma가 에러를 던지지만 명시적으로 처리 가능)
    return this.prisma.cfgAdminUser.create({
      data: {
        loginId: data.loginId,
        role: data.role,
        assignedBy: data.assignedBy || 'System', // [수정] 기본값 처리
      },
    });
  }

  async deleteAdmin(loginId: string) {
    return this.prisma.cfgAdminUser.delete({
      where: { loginId },
    });
  }

  // 3. 접근 코드 (ref_access_code)
  async getAllAccessCodes() {
    return this.prisma.refAccessCode.findMany({
      orderBy: { updatedAt: 'desc' },
    });
  }

  async createAccessCode(data: CreateAccessCodeDto) {
    return this.prisma.refAccessCode.create({
      data: {
        compid: data.compid,
        deptid: data.deptid,
        description: data.description,
        isActive: data.isActive || 'Y',
      },
    });
  }

  async updateAccessCode(compid: string, data: UpdateAccessCodeDto) {
    return this.prisma.refAccessCode.update({
      where: { compid },
      data: {
        deptid: data.deptid,
        description: data.description,
        isActive: data.isActive,
      },
    });
  }

  async deleteAccessCode(compid: string) {
    return this.prisma.refAccessCode.delete({
      where: { compid },
    });
  }

  // 4. 게스트 정책 (cfg_guest_access)
  async getAllGuests() {
    return this.prisma.cfgGuestAccess.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async addGuest(data: CreateGuestDto) {
    return this.prisma.cfgGuestAccess.create({
      data: {
        loginId: data.loginId,
        requester: data.requester,
        grantedRole: data.grantedRole || 'GUEST',
        validUntil: new Date(data.validUntil), // Date 객체로 변환
        reason: data.reason,
      },
    });
  }

  async deleteGuest(loginId: string) {
    return this.prisma.cfgGuestAccess.delete({
      where: { loginId },
    });
  }

  // 5. [New] 장비 목록 (ref_equipment)
  async getRefEquipments() {
    return this.prisma.refEquipment.findMany({
      orderBy: { eqpid: 'asc' },
    });
  }
}
