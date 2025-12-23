// backend/src/admin/admin.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  CreateAdminDto,
  CreateAccessCodeDto,
  UpdateAccessCodeDto,
  CreateGuestDto,
  ApproveGuestRequestDto,
  RejectGuestRequestDto,
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // 1. Users
  async getAllUsers() {
    return this.prisma.sysUser.findMany({
      include: {
        context: { include: { sdwtInfo: true } },
      },
      orderBy: { lastLoginAt: 'desc' },
    });
  }

  // 2. Admins
  async getAllAdmins() {
    return this.prisma.cfgAdminUser.findMany({
      orderBy: { assignedAt: 'desc' },
    });
  }

  async addAdmin(data: CreateAdminDto) {
    return this.prisma.cfgAdminUser.create({
      data: {
        loginId: data.loginId,
        role: data.role,
        assignedBy: data.assignedBy || 'System',
      },
    });
  }

  async deleteAdmin(loginId: string) {
    return this.prisma.cfgAdminUser.delete({
      where: { loginId },
    });
  }

  // 3. Access Codes
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

  // 4. 게스트 정책
  async getAllGuests() {
    return this.prisma.cfgGuestAccess.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // [수정] 수동 추가 시 deptCode 저장
  async addGuest(data: CreateGuestDto) {
    return this.prisma.cfgGuestAccess.create({
      data: {
        loginId: data.loginId,
        deptName: data.deptName,
        deptCode: data.deptCode, // [추가]
        grantedRole: data.grantedRole || 'GUEST',
        validUntil: new Date(data.validUntil),
        reason: data.reason,
      },
    });
  }

  async deleteGuest(loginId: string) {
    return this.prisma.cfgGuestAccess.delete({
      where: { loginId },
    });
  }

  // 5. 게스트 요청 관리
  async getGuestRequests() {
    return this.prisma.cfgGuestRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // [수정] 승인 시 deptCode 이관
  async approveGuestRequest(data: ApproveGuestRequestDto) {
    return this.prisma.$transaction(async (tx) => {
      const req = await tx.cfgGuestRequest.findUnique({
        where: { reqId: data.reqId },
      });
      if (!req) throw new Error('Request not found');

      await tx.cfgGuestAccess.upsert({
        where: { loginId: req.loginId },
        update: {
          validUntil: new Date(data.validUntil),
          grantedRole: data.grantedRole || 'GUEST',
          deptName: req.deptName,
          deptCode: req.deptCode, // [추가]
          reason: req.reason,
          createdAt: new Date(),
        },
        create: {
          loginId: req.loginId,
          deptName: req.deptName,
          deptCode: req.deptCode, // [추가]
          reason: req.reason,
          validUntil: new Date(data.validUntil),
          grantedRole: data.grantedRole || 'GUEST',
        },
      });

      return tx.cfgGuestRequest.update({
        where: { reqId: data.reqId },
        data: {
          status: 'APPROVED',
          processedBy: data.approverId,
          processedAt: new Date(),
        },
      });
    });
  }

  async rejectGuestRequest(data: RejectGuestRequestDto) {
    return this.prisma.cfgGuestRequest.update({
      where: { reqId: data.reqId },
      data: {
        status: 'REJECTED',
        processedBy: data.approverId,
        processedAt: new Date(),
      },
    });
  }

  // 6. Equipments
  async getRefEquipments() {
    return this.prisma.refEquipment.findMany({
      orderBy: { eqpid: 'asc' },
    });
  }
}
