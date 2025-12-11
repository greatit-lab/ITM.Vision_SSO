// backend/src/health/health.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface HealthDto {
  eqpId: string;
  totalScore: number;
  status: 'Good' | 'Warning' | 'Critical';
  factors: {
    reliability: number;
    performance: number;
    component: number;
    stability: number;
  };
  details: {
    errorCount: number;
    avgResourceUsage: number;
    lampUsageRatio: number;
    tempVolatility: number;
  };
}

// [수정] Raw Query 결과를 위한 인터페이스 정의
interface PerfStatRaw {
  eqpid: string;
  avgUsage: number | null;
  tempStd: number | null;
}

interface LampStatRaw {
  eqpid: string;
  usageRatio: number | null;
}

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  async getHealthSummary(site?: string, sdwt?: string): Promise<HealthDto[]> {
    // 1. 대상 장비 목록 조회
    const equipments = await this.prisma.refEquipment.findMany({
      where: {
        sdwtRel: {
          isUse: 'Y',
          ...(site ? { site } : {}),
        },
        ...(sdwt ? { sdwt } : {}),
      },
      select: { eqpid: true },
    });

    const eqpIds = equipments.map((e) => e.eqpid);
    if (eqpIds.length === 0) return [];

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // 2. 병렬 데이터 집계
    
    // 2-1. 에러 건수
    const errorStats = await this.prisma.plgError.groupBy({
      by: ['eqpid'],
      where: { eqpid: { in: eqpIds }, timeStamp: { gte: sevenDaysAgo } },
      _count: { _all: true },
    });

    // 2-2. 리소스 및 온도 통계 (SQL Injection 방지 처리 및 타입 캐스팅)
    const eqpIdString = eqpIds.map((id) => `'${id}'`).join(',');
    
    // [수정] 타입 안전하게 쿼리 실행
    const perfRaw = await this.prisma.$queryRawUnsafe(
      `SELECT 
        eqpid, 
        AVG(cpu_usage + mem_usage) / 2 as "avgUsage",
        STDDEV(cpu_temp) as "tempStd"
      FROM public.eqp_perf
      WHERE eqpid IN (${eqpIdString})
        AND serv_ts >= '${oneDayAgo.toISOString()}'
      GROUP BY eqpid`
    );
    // ESLint 회피: unknown -> defined type casting
    const perfStats = perfRaw as PerfStatRaw[];

    // 2-3. 램프 수명
    const lampRaw = await this.prisma.$queryRawUnsafe(
      `SELECT eqpid, MAX(age_hour::float / NULLIF(lifespan_hour, 0)) as "usageRatio"
      FROM public.eqp_lamp_life
      WHERE eqpid IN (${eqpIdString})
      GROUP BY eqpid`
    );
    const lampStats = lampRaw as LampStatRaw[];

    // 3. 데이터 매핑
    const errorMap = new Map(errorStats.map((e) => [e.eqpid, e._count._all]));
    
    // [수정] 명시적 타입 사용으로 Unsafe Access 해결
    const perfMap = new Map(perfStats.map((p) => [
      p.eqpid, 
      { usage: Number(p.avgUsage || 0), std: Number(p.tempStd || 0) }
    ]));
    
    const lampMap = new Map(lampStats.map((l) => [
      l.eqpid, 
      Number(l.usageRatio || 0)
    ]));

    return eqpIds.map((eqpId) => {
      // (A) 신뢰성
      const errorCount = errorMap.get(eqpId) || 0;
      const reliabilityScore = Math.max(0, 40 - errorCount * 4);

      // (B) 성능
      const perf = perfMap.get(eqpId) || { usage: 0, std: 0 };
      const resourceScore = Math.max(0, 30 * (1 - Math.max(0, perf.usage - 20) / 70));

      // (C) 부품
      const lampRatio = lampMap.get(eqpId) || 0;
      const componentScore = Math.max(0, 20 * (1 - Math.min(1, lampRatio)));

      // (D) 안정성
      const stabilityScore = Math.max(0, 10 * (1 - Math.min(1, perf.std / 5)));

      const totalScore = Math.round(reliabilityScore + resourceScore + componentScore + stabilityScore);

      let status: 'Good' | 'Warning' | 'Critical' = 'Good';
      if (totalScore < 60) status = 'Critical';
      else if (totalScore < 80) status = 'Warning';

      return {
        eqpId,
        totalScore,
        status,
        factors: {
          reliability: Math.round(reliabilityScore),
          performance: Math.round(resourceScore),
          component: Math.round(componentScore),
          stability: Math.round(stabilityScore),
        },
        details: {
          errorCount,
          avgResourceUsage: perf.usage,
          lampUsageRatio: lampRatio * 100,
          tempVolatility: perf.std,
        },
      };
    }).sort((a, b) => a.totalScore - b.totalScore);
  }
}
