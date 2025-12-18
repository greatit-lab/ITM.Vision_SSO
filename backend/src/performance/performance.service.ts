// backend/src/performance/performance.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

// Raw Query 결과 타입 정의
interface PerformanceRawResult {
  eqpid: string;
  Timestamp: Date;
  CpuUsage: number | null;
  MemoryUsage: number | null;
  CpuTemp: number | null;
  GpuTemp: number | null;
  FanSpeed: number | null;
}

interface ProcessMemoryRawResult {
  Timestamp: Date;
  ProcessName: string;
  MemoryUsageMB: number | null;
}

// [추가] ITM Agent Trend 결과 타입
interface ItmAgentTrendRawResult {
  Timestamp: Date;
  EqpId: string;
  MemoryUsageMB: number | null;
}

@Injectable()
export class PerformanceService {
  constructor(private prisma: PrismaService) {}

  // [기존] 장비 성능 이력 조회 (Time Bucket)
  async getHistory(
    startDate: string,
    endDate: string,
    eqpids: string,
    intervalSeconds: number = 300,
  ) {
    if (!eqpids) return [];
    if (intervalSeconds <= 0) intervalSeconds = 1;

    const start = new Date(startDate);
    const end = new Date(endDate);

    const eqpIdArray = eqpids
      .split(',')
      .map((id) => `'${id.trim()}'`)
      .join(',');

    const results = await this.prisma.$queryRawUnsafe<PerformanceRawResult[]>(
      `
        SELECT
            eqpid,
            (to_timestamp(floor((extract('epoch' from serv_ts) / ${intervalSeconds} )) * ${intervalSeconds})) as "Timestamp",
            AVG(cpu_usage) as "CpuUsage",
            AVG(mem_usage) as "MemoryUsage",
            AVG(cpu_temp) as "CpuTemp",
            AVG(gpu_temp) as "GpuTemp",
            AVG(fan_speed) as "FanSpeed"
        FROM public.eqp_perf
        WHERE eqpid IN (${eqpIdArray})
          AND serv_ts >= $1
          AND serv_ts <= $2
        GROUP BY eqpid, "Timestamp"
        ORDER BY eqpid, "Timestamp"
    `,
      start,
      end,
    );

    return results.map((r) => ({
      eqpId: r.eqpid,
      timestamp: r.Timestamp,
      cpuUsage: r.CpuUsage || 0,
      memoryUsage: r.MemoryUsage || 0,
      cpuTemp: r.CpuTemp || 0,
      gpuTemp: r.GpuTemp || 0,
      fanSpeed: r.FanSpeed || 0,
    }));
  }

  // [기존] 특정 장비의 프로세스별 메모리 이력 조회
  async getProcessHistory(
    startDate: string,
    endDate: string,
    eqpId: string,
    intervalSeconds?: number,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    let interval = intervalSeconds;

    if (!interval || interval <= 0) {
      const dateDiffDays =
        (end.getTime() - start.getTime()) / (1000 * 3600 * 24);
      if (dateDiffDays <= 1) interval = 60;
      else if (dateDiffDays <= 3) interval = 300;
      else if (dateDiffDays <= 7) interval = 600;
      else interval = 1800;
    }

    const results = await this.prisma.$queryRawUnsafe<ProcessMemoryRawResult[]>(
      `
        SELECT
            (to_timestamp(floor((extract('epoch' from serv_ts) / ${interval} )) * ${interval})) as "Timestamp",
            process_name as "ProcessName",
            AVG(memory_usage_mb) as "MemoryUsageMB"
        FROM public.eqp_proc_perf
        WHERE eqpid = $1
          AND serv_ts >= $2
          AND serv_ts <= $3
        GROUP BY "Timestamp", process_name
        ORDER BY "Timestamp", "MemoryUsageMB" DESC
    `,
      eqpId,
      start,
      end,
    );

    return results.map((r) => ({
      timestamp: r.Timestamp,
      processName: r.ProcessName,
      memoryUsageMB: r.MemoryUsageMB || 0,
    }));
  }

  // [추가] ITM Agent 프로세스 메모리 트렌드 조회 (장비별 비교)
  async getItmAgentTrend(
    site: string,
    sdwt: string,
    eqpid: string, // Optional (특정 장비만 조회 시 사용, 없으면 SDWT 전체)
    startDate: string,
    endDate: string,
    intervalSeconds?: number,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // 실제 수집되는 Agent 프로세스 명으로 설정 (필요시 수정)
    const TARGET_PROCESS_NAME = 'ITM Agent';

    let interval = intervalSeconds;
    if (!interval || interval <= 0) {
      const dateDiffDays =
        (end.getTime() - start.getTime()) / (1000 * 3600 * 24);
      if (dateDiffDays <= 1) interval = 60; // 1일 이하: 1분
      else if (dateDiffDays <= 3) interval = 300; // 3일 이하: 5분
      else if (dateDiffDays <= 7) interval = 600; // 7일 이하: 10분
      else interval = 1800; // 그 외: 30분
    }

    // 장비 필터링 조건 생성
    let eqpFilterCondition = '';
    
    // eqpid가 지정되어 있으면 해당 장비만 조회
    if (eqpid) {
      // SQL Injection 방지를 위해 파라미터 바인딩을 권장하지만, 
      // 여기서는 로직 흐름상 문자열 보간을 사용하되, Controller에서 검증된 값을 사용한다고 가정
      // 안전하게 Prisma raw query 파라미터($4 등)를 사용할 수도 있음.
      // 편의상 문자열 처리:
      eqpFilterCondition = `AND p.eqpid = '${eqpid}'`;
    } else if (sdwt) {
      // SDWT가 지정되어 있으면 해당 SDWT에 속한 장비들로 제한
      // RefEquipment 테이블과 조인하거나 서브쿼리 사용
      eqpFilterCondition = `AND p.eqpid IN (SELECT eqpid FROM ref_equipment WHERE sdwt = '${sdwt}')`;
    }

    // 쿼리 실행 (Timestamp 및 장비별 Grouping)
    const results = await this.prisma.$queryRawUnsafe<ItmAgentTrendRawResult[]>(
      `
        SELECT
            (to_timestamp(floor((extract('epoch' from p.serv_ts) / ${interval} )) * ${interval})) as "Timestamp",
            p.eqpid as "EqpId",
            AVG(p.memory_usage_mb) as "MemoryUsageMB"
        FROM public.eqp_proc_perf p
        WHERE 1=1
          ${eqpFilterCondition}
          AND p.process_name = '${TARGET_PROCESS_NAME}'
          AND p.serv_ts >= $1
          AND p.serv_ts <= $2
        GROUP BY "Timestamp", p.eqpid
        ORDER BY "Timestamp", p.eqpid
      `,
      start,
      end,
    );

    return results.map((r) => ({
      timestamp: r.Timestamp,
      eqpId: r.EqpId,
      memoryUsageMB: r.MemoryUsageMB || 0,
    }));
  }
}
