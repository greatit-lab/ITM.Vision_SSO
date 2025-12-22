// backend/src/infra/infra.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RefSdwt, CfgServer, Prisma } from '@prisma/client';

@Injectable()
export class InfraService {
  constructor(private prisma: PrismaService) {}

  // --- 1. SDWT (ref_sdwt) ---
  async getSdwts(): Promise<RefSdwt[]> {
    return await this.prisma.refSdwt.findMany({
      orderBy: { sdwt: 'asc' },
    });
  }

  // [추가] SDWT 생성
  async createSdwt(data: Prisma.RefSdwtCreateInput): Promise<RefSdwt> {
    // Note: 'update' 필드는 DB default(now())가 있지만, 명시적으로 넣고 싶다면 data에 포함
    return await this.prisma.refSdwt.create({ data });
  }

  // [추가] SDWT 수정
  async updateSdwt(id: string, data: Prisma.RefSdwtUpdateInput): Promise<RefSdwt> {
    return await this.prisma.refSdwt.update({
      where: { id },
      data: {
        ...data,
        update: new Date(), // 수정 시 update 시간 갱신
      },
    });
  }

  // [추가] SDWT 삭제
  async deleteSdwt(id: string): Promise<RefSdwt> {
    return await this.prisma.refSdwt.delete({
      where: { id },
    });
  }

  // --- 3. Agent Server Config (cfg_server) ---
  async getAgentServers(): Promise<CfgServer[]> {
    return await this.prisma.cfgServer.findMany({
      orderBy: { eqpid: 'asc' },
    });
  }

  async createAgentServer(data: Prisma.CfgServerCreateInput): Promise<CfgServer> {
    return await this.prisma.cfgServer.create({ data });
  }

  async updateAgentServer(eqpid: string, data: Prisma.CfgServerUpdateInput): Promise<CfgServer> {
    return await this.prisma.cfgServer.update({
      where: { eqpid },
      data,
    });
  }

  async deleteAgentServer(eqpid: string): Promise<CfgServer> {
    return await this.prisma.cfgServer.delete({
      where: { eqpid },
    });
  }
}
