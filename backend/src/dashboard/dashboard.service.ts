// backend/src/dashboard/dashboard.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

// Raw Query 결과 타입 정의 (기존 유지)
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

  // 버전 비교 헬퍼 함수 (기존 유지)
  private compareVersions(v1: string, v2: string) {
    const p1 = v1.replace(/[^0-9.]/g, '').split('.').map(Number);
    const p2 = v2.replace(/[^0-9.]/g, '').split('.').map(Number);
    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
      const n1 = p1[i] || 0;
      const n2 = p2[i] || 0;
      if (n1 > n2) return 1;
      if (n1 < n2) return -1;
    }
    return 0;
  }

  // [수정] 500 에러 방지 및 최신 스키마(cfg_server) 반영
  async getSummary(site?: string, sdwt?: string) {
    try {
      // 1. 최신 Agent 버전 조회 (기존 로직 유지)
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

      // 2. 필터 조건 생성
      const equipmentWhere: Prisma.RefEquipmentWhereInput = {
        sdwtRel: {
          isUse: 'Y',
          ...(site ? { site } : {}),
        },
        ...(sdwt ? { sdwt } : {}),
      };

      // 3. 데이터 조회 (병렬 실행)
      // 주의: cfg_server는 RefEquipment와 직접 Relation이 없을 수 있으므로 별도 조회
      const [totalEqp, servers, totalSdwts] = await Promise.all([
        // 전체 장비 수
        this.prisma.refEquipment.count({ where: equipmentWhere }),
        
        // Agent 서버 목록 (cfg_server) 조회
        this.prisma.cfgServer.findMany(),

        // SDWT 구성 수
        this.prisma.refSdwt.count({
          where: { isUse: 'Y', ...(site ? { site } : {}) }
        })
      ]);

      // 4. 활성 서버(Active Server) 계산 로직 수정
      // cfg_server의 update 컬럼이 최근 10분 이내이면 Online으로 간주
      const now = new Date();
      const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
      const totalServers = servers.length;

      const activeServers = servers.filter((server) => {
        if (!server.update) return false;
        const lastUpdate = new Date(server.update);
        return lastUpdate > tenMinutesAgo;
      }).length;

      // 5. 금일 에러 건수 조회 (기존 로직 활용, null safety 강화)
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // 에러 테이블 조회는 별도로 수행 (실패해도 메인 통계는 나가도록)
      let todayErrorCount = 0;
      let todayErrorTotalCount = 0;
      let newAlarmCount = 0;

      try {
        const errorStats = await Promise.all([
          // 장비별 에러 발생 수 (GroupBy)
          this.prisma.plgError.groupBy({
            by: ['eqpid'],
            where: {
              timeStamp: { gte: startOfToday },
              equipment: equipmentWhere,
            },
          }),
          // 총 에러 발생 수
          this.prisma.plgError.count({
            where: {
              timeStamp: { gte: startOfToday },
              equipment: equipmentWhere,
            },
          }),
          // 최근 1시간 에러
          this.prisma.plgError.count({
            where: { timeStamp: { gte: oneHourAgo }, equipment: equipmentWhere },
          }),
        ]);

        todayErrorCount = errorStats[0].length;
        todayErrorTotalCount = errorStats[1];
        newAlarmCount = errorStats[2];
      } catch (err) {
        console.warn("[DashboardService] Error stats query failed, returning 0:", err);
      }

      // 6. 결과 반환 (FE에서 기대하는 구조 유지)
      return {
        totalEqpCount: totalEqp,
        totalServers: totalServers, // FE 추가 필요 시 사용
        onlineAgentCount: activeServers, // 기존 FE 필드명 매핑 (Active Server)
        inactiveAgentCount: totalServers - activeServers,
        todayErrorCount,
        todayErrorTotalCount,
        newAlarmCount,
        latestAgentVersion,
        totalSdwts, // 추가 정보
        serverHealth: totalServers > 0 ? Math.round((activeServers / totalServers) * 100) : 0
      };

    } catch (error) {
      console.error("[DashboardService] getSummary Critical Error:", error);
      // 500 에러를 던지지만, NestJS Exception Filter가 처리하도록 함
      throw new InternalServerErrorException("Failed to fetch dashboard summary");
    }
  }

  // [기존] getAgentStatus 메서드는 그대로 유지
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
