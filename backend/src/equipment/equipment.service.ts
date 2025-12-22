// backend/src/equipment/equipment.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

// [기존 DTO 유지]
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

// [New] 인프라 관리용 단순 조회 DTO
export interface InfraListDto {
  eqpId: string;
  sdwt: string;
  site: string;
  campus: string;
  isUse: string;
}

@Injectable()
export class EquipmentService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * [New] 인프라 관리 화면용 단순 목록 조회
   * - 500 에러 방지를 위해 복잡한 Join 없이 Master 데이터만 조회
   * - ref_equipment + ref_sdwt (소속 정보)
   */
  async getInfraList(): Promise<InfraListDto[]> {
    const list = await this.prisma.refEquipment.findMany({
      include: {
        sdwtRel: true, // 소속(Site/Campus) 정보 조인
      },
      orderBy: {
        eqpid: 'asc',
      },
    });

    return list.map((item) => ({
      eqpId: item.eqpid,
      // [Fix] 타입 오류 수정: sdwt가 null로 추론될 경우를 대비해 기본값('-') 할당
      sdwt: item.sdwt || '-',
      site: item.sdwtRel?.site || '-',
      campus: item.sdwtRel?.campus || '-',
      isUse: item.sdwtRel?.isUse || 'N',
    }));
  }

  /**
   * 장비 상세 정보 조회 (Agent 정보 포함) - 기존 유지
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
   * 장비 ID 목록 조회 - 기존 유지
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
}
