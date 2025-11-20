import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class EquipmentService {
  constructor(private prisma: PrismaService) {}

  async getDetails(site?: string, sdwt?: string, eqpid?: string) {
    let whereSql = '';
    
    if (eqpid) whereSql = `WHERE r.eqpid = '${eqpid}'`;
    else if (sdwt) whereSql = `WHERE r.sdwt = '${sdwt}'`;
    else if (site) whereSql = `WHERE r.sdwt IN (SELECT sdwt FROM public.ref_sdwt WHERE site = '${site}')`;

    const results = await this.prisma.$queryRawUnsafe<any[]>(`
        SELECT
            a.eqpid, a.pc_name, 
            CASE WHEN COALESCE(s.status, 'OFFLINE') = 'ONLINE' THEN true ELSE false END AS is_online,
            a.ip_address, s.last_perf_update, a.os, a.system_type, a.timezone,
            a.mac_address, a.cpu, a.memory, a.disk, a.vga, a.type, a.locale,
            i.system_model, i.serial_num, i.application, i.version, i.db_version
        FROM public.agent_info a
        JOIN public.ref_equipment r ON a.eqpid = r.eqpid
        LEFT JOIN public.agent_status s ON a.eqpid = s.eqpid
        LEFT JOIN public.itm_info i ON a.eqpid = i.eqpid
        ${whereSql}
        ORDER BY a.eqpid
    `);

    return results.map(r => ({
      eqpId: r.eqpid,
      pcName: r.pc_name || 'N/A',
      isOnline: r.is_online,
      ipAddress: r.ip_address || 'N/A',
      lastContact: r.last_perf_update,
      os: r.os || 'N/A',
      systemType: r.system_type || '',
      timezone: r.timezone || 'N/A',
      cpu: r.cpu || 'N/A',
      memory: r.memory || 'N/A',
      disk: r.disk || 'N/A',
      vga: r.vga || 'N/A',
      type: r.type || 'N/A',
      locale: r.locale || 'N/A',
      systemModel: r.system_model || 'N/A',
      serialNum: r.serial_num || 'N/A',
      application: r.application || 'N/A',
      version: r.version || 'N/A',
      dbVersion: r.db_version || 'N/A'
    }));
  }

  async getEqpIds(site?: string, sdwt?: string) {
    let whereSql = '';
    if (sdwt) whereSql = `WHERE r.sdwt = '${sdwt}'`;
    else if (site) whereSql = `WHERE r.sdwt IN (SELECT sdwt FROM public.ref_sdwt WHERE site = '${site}')`;

    const results = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT r.eqpid FROM public.ref_equipment r ${whereSql} ORDER BY r.eqpid
    `);
    return results.map(r => r.eqpid);
  }
}
