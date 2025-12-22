// backend/src/equipment/equipment.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RefEquipment, Prisma } from '@prisma/client';

// [DTO 정의 복구] - 다른 페이지(Equipment Explorer 등)에서 사용
export interface EquipmentRaw {
  eqpid: string;
  pc_name: string;
  is_online: boolean;
  ip_address: string;
  last_perf_update: Date | null;
  os: string;
  system_type: string;
  timezone: string;
  mac_address: string;
  cpu: string;
  memory: string;
  disk: string;
  vga: string;
  type: string;
  locale: string;
  system_model: string;
  serial_num: string;
  application: string;
  version: string;
  db_version: string;
}

export interface EquipmentDto {
  eqpId: string;
  pcName: string;
  isOnline: boolean;
  ipAddress: string;
  lastContact: Date | null;
  os: string;
  systemType: string;
  timezone: string;
  macAddress: string;
  cpu: string;
  memory: string;
  disk: string;
  vga: string;
  type: string;
  locale: string;
  systemModel: string;
  serialNum: string;
  application: string;
  version: string;
  dbVersion: string;
}

@Injectable()
export class EquipmentService {
  constructor(private readonly prisma: PrismaService) {}

  // =================================================================
  // 1. [Infra Management] 인프라 관리용 단순 조회 (수정 요청 사항 반영)
  // =================================================================
  /**
   * 인프라 관리 화면용 목록 조회
   * - agent_info, agent_status 등 다른 테이블과 연관시키지 않음
   * - 오직 ref_equipment 테이블의 데이터만 조회
   */
  async getInfraList(): Promise<RefEquipment[]> {
    return await this.prisma.refEquipment.findMany({
      orderBy: {
        eqpid: 'asc',
      },
      // include 옵션 없음 (순수 ref_equipment 데이터만 조회)
    });
  }

  // =================================================================
  // 2. [Equipment Explorer] 장비 탐색기/상세용 복잡한 조회 (기존 복구)
  // =================================================================
  async getDetails(
    site?: string,
    sdwt?: string,
    eqpId?: string,
  ): Promise<EquipmentDto[]> {
    let sql = `
      SELECT
          a.eqpid, a.pc_name, COALESCE(s.status, 'OFFLINE') = 'ONLINE' AS is_online,
          a.ip_address, s.last_perf_update, a.os, a.system_type, a.timezone,
          a.mac_address, a.cpu, a.memory, a.disk, a.vga, a.type, a.locale,
          i.system_model, i.serial_num, i.application, i.version, i.db_version
      FROM public.agent_info a
      JOIN public.ref_equipment r ON a.eqpid = r.eqpid
      LEFT JOIN public.agent_status s ON a.eqpid = s.eqpid
      LEFT JOIN public.itm_info i ON a.eqpid = i.eqpid
      WHERE 1=1
    `;

    const params: string[] = [];
    let paramIndex = 1;

    if (eqpId) {
      sql += ` AND r.eqpid = $${paramIndex++}`;
      params.push(eqpId);
    } else if (sdwt) {
      sql += ` AND r.sdwt = $${paramIndex++}`;
      params.push(sdwt);
    } else if (site) {
      sql += ` AND r.sdwt IN (SELECT sdwt FROM public.ref_sdwt WHERE site = $${paramIndex++})`;
      params.push(site);
    }

    sql += ' ORDER BY a.eqpid';

    const rawData = await this.prisma.$queryRawUnsafe<EquipmentRaw[]>(
      sql,
      ...params,
    );

    return rawData.map((r) => ({
      eqpId: r.eqpid,
      pcName: r.pc_name || 'N/A',
      isOnline: r.is_online,
      ipAddress: r.ip_address || '',
      lastContact: r.last_perf_update,
      os: r.os || '',
      systemType: r.system_type || '',
      timezone: r.timezone || '',
      macAddress: r.mac_address || '',
      cpu: r.cpu || '',
      memory: r.memory || '',
      disk: r.disk || '',
      vga: r.vga || '',
      type: r.type || '',
      locale: r.locale || '',
      systemModel: r.system_model || '',
      serialNum: r.serial_num || '',
      application: r.application || '',
      version: r.version || '',
      dbVersion: r.db_version || '',
    }));
  }

  async getEqpIds(
    site?: string,
    sdwt?: string,
    type?: string,
  ): Promise<string[]> {
    if (!site && !sdwt) {
      return [];
    }

    let sql = 'SELECT r.eqpid FROM public.ref_equipment r';
    const params: string[] = [];
    let paramIndex = 1;
    const whereClauses: string[] = [];

    if (type) {
      if (type.toLowerCase() === 'agent') {
        sql += ' JOIN public.agent_info a ON r.eqpid = a.eqpid';
      }
    }

    if (sdwt) {
      whereClauses.push(`r.sdwt = $${paramIndex++}`);
      params.push(sdwt);
    } else if (site) {
      whereClauses.push(
        `r.sdwt IN (SELECT sdwt FROM public.ref_sdwt WHERE site = $${paramIndex++})`,
      );
      params.push(site);
    }

    if (whereClauses.length > 0) {
      sql += ' WHERE ' + whereClauses.join(' AND ');
    }
    sql += ' ORDER BY r.eqpid';

    const rawData = await this.prisma.$queryRawUnsafe<{ eqpid: string }[]>(
      sql,
      ...params,
    );

    return rawData.map((r) => r.eqpid);
  }

  // =================================================================
  // 3. [Basic CRUD] 기본 기능
  // =================================================================
  async create(data: Prisma.RefEquipmentCreateInput): Promise<RefEquipment> {
    return await this.prisma.refEquipment.create({ data });
  }

  async findOne(eqpid: string): Promise<RefEquipment | null> {
    return await this.prisma.refEquipment.findUnique({
      where: { eqpid },
    });
  }

  async update(
    eqpid: string,
    data: Prisma.RefEquipmentUpdateInput,
  ): Promise<RefEquipment> {
    return await this.prisma.refEquipment.update({
      where: { eqpid },
      data,
    });
  }

  async remove(eqpid: string): Promise<RefEquipment> {
    return await this.prisma.refEquipment.delete({
      where: { eqpid },
    });
  }
}
