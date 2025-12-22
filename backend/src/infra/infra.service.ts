// backend/src/infra/infra.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RefSdwt, CfgInfraServer, CfgServer, Prisma } from '@prisma/client';

@Injectable()
export class InfraService {
  constructor(private prisma: PrismaService) {}

  // --- 1. SDWT (ref_sdwt) ---
  async getSdwts(): Promise<RefSdwt[]> {
    return await this.prisma.refSdwt.findMany({
      orderBy: { sdwt: 'asc' },
    });
  }

  // --- 2. Infra Server List (cfg_infra_server) ---
  // * 변경: data 타입을 any에서 Prisma Generated Type으로 변경하여 ESLint 오류 해결
  async getInfraServers(): Promise<CfgInfraServer[]> {
    return await this.prisma.cfgInfraServer.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async createInfraServer(data: Prisma.CfgInfraServerCreateInput): Promise<CfgInfraServer> {
    return await this.prisma.cfgInfraServer.create({ data });
  }

  async updateInfraServer(id: number, data: Prisma.CfgInfraServerUpdateInput): Promise<CfgInfraServer> {
    return await this.prisma.cfgInfraServer.update({
      where: { id },
      data,
    });
  }

  async deleteInfraServer(id: number): Promise<CfgInfraServer> {
    return await this.prisma.cfgInfraServer.delete({
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
