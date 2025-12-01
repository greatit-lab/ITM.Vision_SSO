// backend/src/dashboard/dashboard.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

// [기존] Raw Query 결과 타입 정의
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

  // [기존] 버전 비교 헬퍼 함수
  private compareVersions(v1: string, v2: string) {
    const p1 = v1
      .replace(/[^0-9.]/g, '')
      .split('.')
      .map(Number);
    const p2 = v2
      .replace(/[^0-9.]/g, '')
      .split('.')
      .map(Number);
    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
      const n1 = p1[i] || 0;
      const n2 = p2[i] || 0;
      if (n1 > n2) return 1;
      if (n1 < n2) return -1;
    }
    return 0;
  }

  async getSummary(site?: string, sdwt?: string) {
    // 1. 전체 Agent Info에서 최신 버전 조회
    const distinctVersions = await this.prisma.agentInfo.findMany({
      distinct: ['appVer'],
      select: { appVer: true },
      where: { appVer: { not: null } },
    });

    const versions = distinctVersions
      .map((v) => v.appVer)
      .filter((v) => v) as string[];

    versions.sort((a, b) => this.compareVersions(a, b));
    const latestAgentVersion =
      versions.length > 0 ? versions[versions.length - 1] : '';

    // 2. 대시보드 통계용 필터 조건 생성
    const equipmentWhere: Prisma.RefEquipmentWhereInput = {
      sdwtRel: {
        isUse: 'Y',
        ...(site ? { site } : {}),
      },
      ...(sdwt ? { sdwt } : {}),
      agentInfo: {
        isNot: null,
      },
    };

    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // 3. 병렬 쿼리 실행
    const [totalEqp, onlineEqp, errorEqpGroup, todayErrorTotal, newAlarm] =
      await Promise.all([
        // Total Agents
        this.prisma.refEquipment.count({ where: equipmentWhere }),

        // Online Agents
        this.prisma.refEquipment.count({
          where: { ...equipmentWhere, agentStatus: { status: 'ONLINE' } },
        }),

        // [수정] Alerts (장비 수): GroupBy로 에러가 발생한 '장비'의 개수를 셈
        this.prisma.plgError.groupBy({
          by: ['eqpid'],
          where: {
            timeStamp: { gte: startOfToday },
            equipment: equipmentWhere,
          },
        }),

        // [추가] Alerts (총 발생 건수): 기존 로직 유지 (보조 정보용)
        this.prisma.plgError.count({
          where: {
            timeStamp: { gte: startOfToday },
            equipment: equipmentWhere,
          },
        }),

        // New Alarms (최근 1시간 발생 건수)
        this.prisma.plgError.count({
          where: { timeStamp: { gte: oneHourAgo }, equipment: equipmentWhere },
        }),
      ]);

    return {
      totalEqpCount: totalEqp,
      onlineAgentCount: onlineEqp,
      todayErrorCount: errorEqpGroup.length, // [변경] 장비 대수 (예: 1)
      todayErrorTotalCount: todayErrorTotal, // [추가] 총 발생 건수 (예: 18)
      newAlarmCount: newAlarm,
      latestAgentVersion: latestAgentVersion,
    };
  }

  // ... (getAgentStatus 메서드는 기존 유지) ...
  async getAgentStatus(site?: string, sdwt?: string) {
    let whereCondition = Prisma.sql`WHERE r.sdwt IN (SELECT sdwt FROM public.ref_sdwt WHERE is_use = 'Y')`;

    if (sdwt) {
      whereCondition = Prisma.sql`${whereCondition} AND r.sdwt = ${sdwt}`;
    } else if (site) {
      whereCondition = Prisma.sql`${whereCondition} AND r.sdwt IN (SELECT sdwt FROM public.ref_sdwt WHERE site = ${site})`;
    }

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
          WHERE serv_ts >= NOW() - INTERVAL '1 day' 
      ) p ON a.eqpid = p.eqpid AND p.rn = 1
      LEFT JOIN (
          SELECT eqpid, COUNT(*) AS alarm_count 
          FROM public.plg_error 
          WHERE time_stamp >= CURRENT_DATE
          GROUP BY eqpid
      ) e ON a.eqpid = e.eqpid
      ${whereCondition}
      ORDER BY a.eqpid ASC;
    `;

    return results.map((r) => {
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
        clockDrift: clockDrift,
      };
    });
  }
}
