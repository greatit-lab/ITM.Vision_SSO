import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

interface SummaryRawResult {
  TotalEqpCount: number;
  OnlineAgentCount: number;
  TodayErrorCount: number;
  NewAlarmCount: number;
}

interface AgentStatusRawResult {
  eqpid: string;
  is_online: boolean;
  last_contact: Date | null;
  pc_name: string | null;
  cpu_usage: number;
  mem_usage: number;
  app_ver: string | null;
  type: string | null;
  ip_address: string | null;
  os: string | null;
  system_type: string | null;
  locale: string | null;
  timezone: string | null;
  today_alarm_count: number;
  last_perf_serv_ts: Date | null;
  last_perf_eqp_ts: Date | null;
}

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(site?: string, sdwt?: string) {
    let baseFilter = Prisma.sql`r.sdwt IN (SELECT sdwt FROM public.ref_sdwt WHERE is_use = 'Y')`;

    if (sdwt) {
      baseFilter = Prisma.sql`r.sdwt = ${sdwt} AND ${baseFilter}`;
    } else if (site) {
      baseFilter = Prisma.sql`r.sdwt IN (SELECT sdwt FROM public.ref_sdwt WHERE site = ${site} AND is_use = 'Y')`;
    }

    // [수정] 무거운 TodayDataCount 쿼리 제거
    const result = await this.prisma.$queryRaw<SummaryRawResult[]>`
      SELECT
        (SELECT COUNT(DISTINCT r.eqpid)::int 
         FROM public.ref_equipment r JOIN public.agent_info a ON r.eqpid = a.eqpid 
         WHERE ${baseFilter}) AS "TotalEqpCount",

        (SELECT COUNT(DISTINCT r.eqpid)::int 
         FROM public.ref_equipment r JOIN public.agent_status s ON r.eqpid = s.eqpid 
         WHERE s.status = 'ONLINE' AND ${baseFilter}) AS "OnlineAgentCount",

        (SELECT COUNT(*)::int 
         FROM public.plg_error e JOIN public.ref_equipment r ON e.eqpid = r.eqpid 
         WHERE e.time_stamp >= CURRENT_DATE AND ${baseFilter}) AS "TodayErrorCount",

        (SELECT COUNT(*)::int 
         FROM public.plg_error e JOIN public.ref_equipment r ON e.eqpid = r.eqpid 
         WHERE e.time_stamp >= NOW() - INTERVAL '1 hour' AND ${baseFilter}) AS "NewAlarmCount"
    `;

    const row = result[0] || ({} as SummaryRawResult);

    return {
      totalEqpCount: row.TotalEqpCount || 0,
      onlineAgentCount: row.OnlineAgentCount || 0,
      todayErrorCount: row.TodayErrorCount || 0,
      newAlarmCount: row.NewAlarmCount || 0
    };
  }

  async getAgentStatus(site?: string, sdwt?: string) {
    let whereClause = Prisma.sql`1=1`;

    if (sdwt) {
      whereClause = Prisma.sql`r.sdwt = ${sdwt}`;
    } else if (site) {
      whereClause = Prisma.sql`r.sdwt IN (SELECT sdwt FROM public.ref_sdwt WHERE site = ${site})`;
    }

    // [수정] 최근 1시간 성능 데이터만 조인하도록 최적화
    const results = await this.prisma.$queryRaw<AgentStatusRawResult[]>`
      SELECT 
          a.eqpid, 
          CASE WHEN COALESCE(s.status, 'OFFLINE') = 'ONLINE' THEN true ELSE false END AS is_online, 
          s.last_perf_update AS last_contact,
          a.pc_name, 
          COALESCE(p.cpu_usage, 0) AS cpu_usage, 
          COALESCE(p.mem_usage, 0) AS mem_usage, 
          a.app_ver,
          a.type, a.ip_address, a.os, a.system_type, a.locale, a.timezone,
          COALESCE(e.alarm_count, 0)::int AS today_alarm_count,
          p.serv_ts AS last_perf_serv_ts,
          p.ts AS last_perf_eqp_ts
      FROM public.agent_info a
      JOIN public.ref_equipment r ON a.eqpid = r.eqpid
      LEFT JOIN public.agent_status s ON a.eqpid = s.eqpid
      LEFT JOIN (
          SELECT eqpid, cpu_usage, mem_usage, serv_ts, ts, 
                 ROW_NUMBER() OVER(PARTITION BY eqpid ORDER BY serv_ts DESC) as rn
          FROM public.eqp_perf
          WHERE serv_ts > NOW() - INTERVAL '1 hour' 
      ) p ON a.eqpid = p.eqpid AND p.rn = 1
      LEFT JOIN (
          SELECT eqpid, COUNT(*) AS alarm_count 
          FROM public.plg_error 
          WHERE time_stamp >= CURRENT_DATE
          GROUP BY eqpid
      ) e ON a.eqpid = e.eqpid
      WHERE ${whereClause}
      ORDER BY is_online DESC, a.eqpid;
    `;

    return results.map(r => {
      let clockDrift: number | null = null;
      if (r.last_perf_serv_ts && r.last_perf_eqp_ts) {
        const servTs = new Date(r.last_perf_serv_ts).getTime();
        const eqpTs = new Date(r.last_perf_eqp_ts).getTime();
        clockDrift = (servTs - eqpTs) / 1000;
      }

      return {
        eqpId: r.eqpid,
        isOnline: r.is_online,
        lastContact: r.last_contact,
        pcName: r.pc_name,
        cpuUsage: r.cpu_usage,
        memoryUsage: r.mem_usage,
        appVersion: r.app_ver || '',
        type: r.type || '',
        ipAddress: r.ip_address || '',
        os: r.os || '',
        systemType: r.system_type || '',
        locale: r.locale || '',
        timezone: r.timezone || '',
        todayAlarmCount: r.today_alarm_count,
        clockDrift: clockDrift
      };
    });
  }
}
