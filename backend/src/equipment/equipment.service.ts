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

    // [수정] 타입을 'string[]'으로 명시하여 spread 연산 시 안전하게 처리
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

    // [수정] unknown[]으로 캐스팅하여 Prisma 쿼리에 전달하거나, any[] 오류를 피하기 위해 타입 정의 활용
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

  async getEqpIds(site?: string, sdwt?: string): Promise<string[]> {
    if (!site && !sdwt) {
      return [];
    }

    let sql = 'SELECT r.eqpid FROM public.ref_equipment r';

    // [수정] 타입을 'string[]'으로 명시
    const params: string[] = [];
    let paramIndex = 1;
    const whereClauses: string[] = [];

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
