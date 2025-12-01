// backend/src/performance/performance.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

// [추가] Raw Query 결과에 대한 타입 정의 (ESLint 오류 해결용)
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

@Injectable()
export class PerformanceService {
  constructor(private prisma: PrismaService) {}

  // [C#] GetPerformanceHistory 이식 (Time Bucket 쿼리)
  async getHistory(
    startDate: string,
    endDate: string,
    eqpids: string,
    intervalSeconds: number = 300,
  ) {
    if (!eqpids) return [];
    if (intervalSeconds <= 0) intervalSeconds = 1; // 0 나누기 방지

    // 1. 문자열로 들어온 날짜를 Date 객체로 변환 (Timezone 안전성 확보)
    const start = new Date(startDate);
    const end = new Date(endDate);

    // 2. eqpids 파싱 (SQL Injection 방지를 위해 간단한 따옴표 처리)
    const eqpIdArray = eqpids
      .split(',')
      .map((id) => `'${id.trim()}'`)
      .join(',');

    // 3. 쿼리 실행
    // [수정] any 대신 구체적인 인터페이스(PerformanceRawResult[])를 지정하여 타입 안전성 확보
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
      cpuUsage: r.CpuUsage || 0, // null일 경우 0으로 처리
      memoryUsage: r.MemoryUsage || 0,
      cpuTemp: r.CpuTemp || 0,
      gpuTemp: r.GpuTemp || 0,
      fanSpeed: r.FanSpeed || 0,
    }));
  }

  // [C#] GetProcessPerformanceHistory 이식
  async getProcessHistory(startDate: string, endDate: string, eqpId: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // C# 로직과 동일하게 조회 기간에 따라 interval 자동 계산
    const dateDiffDays = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);
    let intervalSeconds = 1800;
    if (dateDiffDays <= 1) intervalSeconds = 60;
    else if (dateDiffDays <= 3) intervalSeconds = 300;
    else if (dateDiffDays <= 7) intervalSeconds = 600;

    // [수정] any 대신 구체적인 인터페이스(ProcessMemoryRawResult[])를 지정
    const results = await this.prisma.$queryRawUnsafe<ProcessMemoryRawResult[]>(
      `
        SELECT
            (to_timestamp(floor((extract('epoch' from serv_ts) / ${intervalSeconds} )) * ${intervalSeconds})) as "Timestamp",
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
}
