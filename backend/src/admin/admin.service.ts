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
  CreateSeverityDto,
  UpdateSeverityDto,
  CreateMetricDto,
  UpdateMetricDto,
  UpdateNewServerDto,
  CreateCfgServerDto,
  UpdateCfgServerDto,
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // [User & Admin Management]
  // ==========================================
  async getAllUsers() {
    return this.prisma.sysUser.findMany({
      include: {
        context: { include: { sdwtInfo: true } },
      },
      orderBy: { lastLoginAt: 'desc' },
    });
  }

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

  // ==========================================
  // [Access Codes]
  // ==========================================
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

  // ==========================================
  // [Guest Management]
  // ==========================================
  async getAllGuests() {
    return this.prisma.cfgGuestAccess.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async addGuest(data: CreateGuestDto) {
    return this.prisma.cfgGuestAccess.create({
      data: {
        loginId: data.loginId,
        deptName: data.deptName,
        deptCode: data.deptCode,
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

  async getGuestRequests() {
    return this.prisma.cfgGuestRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

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
          deptCode: req.deptCode,
          reason: req.reason,
          createdAt: new Date(),
        },
        create: {
          loginId: req.loginId,
          deptName: req.deptName,
          deptCode: req.deptCode,
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

  // ==========================================
  // [Infra Management] Error Severity Map
  // ==========================================
  async getSeverities() {
    return this.prisma.errSeverityMap.findMany({
      orderBy: { errorId: 'asc' },
    });
  }

  async createSeverity(data: CreateSeverityDto) {
    return this.prisma.errSeverityMap.create({
      data: {
        errorId: data.errorId,
        severity: data.severity,
      },
    });
  }

  async updateSeverity(errorId: string, data: UpdateSeverityDto) {
    return this.prisma.errSeverityMap.update({
      where: { errorId },
      data: {
        severity: data.severity,
      },
    });
  }

  async deleteSeverity(errorId: string) {
    return this.prisma.errSeverityMap.delete({
      where: { errorId },
    });
  }

  // ==========================================
  // [Infra Management] Analysis Metrics
  // ==========================================
  async getMetrics() {
    return this.prisma.cfgLotUniformityMetrics.findMany({
      orderBy: { metricName: 'asc' },
    });
  }

  async createMetric(data: CreateMetricDto) {
    return this.prisma.cfgLotUniformityMetrics.create({
      data: {
        metricName: data.metricName,
        isExcluded:
          typeof data.isExcluded === 'boolean'
            ? data.isExcluded
              ? 'Y'
              : 'N'
            : data.isExcluded,
      },
    });
  }

  async updateMetric(metricName: string, data: UpdateMetricDto) {
    return this.prisma.cfgLotUniformityMetrics.update({
      where: { metricName },
      data: {
        isExcluded:
          typeof data.isExcluded === 'boolean'
            ? data.isExcluded
              ? 'Y'
              : 'N'
            : data.isExcluded,
      },
    });
  }

  async deleteMetric(metricName: string) {
    return this.prisma.cfgLotUniformityMetrics.delete({
      where: { metricName },
    });
  }

  // ==========================================
  // [Equipments]
  // ==========================================
  async getRefEquipments() {
    return this.prisma.refEquipment.findMany({
      orderBy: { eqpid: 'asc' },
    });
  }

  // ==========================================
  // [System Config] Server Configuration
  // ==========================================

  // (1) New Server Config (Single Record)
  async getNewServerConfig() {
    const config = await this.prisma.cfgNewServer.findUnique({
      where: { id: 1 },
    });
    
    // 데이터가 없으면 기본값으로 생성 후 반환 (초기화)
    if (!config) {
      return this.prisma.cfgNewServer.create({
        data: {
          id: 1,
          newDbHost: '',
          newFtpHost: '',
        },
      });
    }
    return config;
  }

  async updateNewServerConfig(data: UpdateNewServerDto) {
    // id=1인 레코드를 업데이트하거나 없으면 생성
    return this.prisma.cfgNewServer.upsert({
      where: { id: 1 },
      update: {
        ...data,
      },
      create: {
        id: 1,
        newDbHost: data.newDbHost || '',
        newFtpHost: data.newFtpHost || '',
        ...data,
      },
    });
  }

  // (2) Cfg Server List (Agent Servers)
  async getCfgServers() {
    return this.prisma.cfgServer.findMany({
      orderBy: { eqpid: 'asc' },
    });
  }

  async createCfgServer(data: CreateCfgServerDto) {
    return this.prisma.cfgServer.create({
      data: {
        eqpid: data.eqpid,
        agentDbHost: data.agentDbHost,
        agentFtpHost: data.agentFtpHost,
        updateFlag: data.updateFlag || 'no',
        update: new Date(),
      },
    });
  }

  async updateCfgServer(eqpid: string, data: UpdateCfgServerDto) {
    return this.prisma.cfgServer.update({
      where: { eqpid },
      data: {
        agentDbHost: data.agentDbHost,
        agentFtpHost: data.agentFtpHost,
        updateFlag: data.updateFlag,
        update: new Date(),
      },
    });
  }

  async deleteCfgServer(eqpid: string) {
    return this.prisma.cfgServer.delete({
      where: { eqpid },
    });
  }
}
