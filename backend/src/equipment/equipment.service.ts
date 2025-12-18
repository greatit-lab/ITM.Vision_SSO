// backend/src/equipment/equipment.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

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

  /**
   * 장비 상세 정보 조회 (Agent 정보 포함)
   */
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

  /**
   * 장비 ID 목록 조회
   * @param type 'agent' | 'wafer' 등 필터링 타입 (선택)
   */
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

    // [추가] 장비 타입 필터링
    if (type) {
      if (type.toLowerCase() === 'agent') {
        // Agent가 설치된 장비만 조회 (Inner Join)
        sql += ' JOIN public.agent_info a ON r.eqpid = a.eqpid';
      }
      // 추후 'wafer' 등 다른 타입 조건이 필요하면 여기에 추가
      // else if (type.toLowerCase() === 'wafer') { ... }
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
}
