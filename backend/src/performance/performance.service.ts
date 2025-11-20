import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PerformanceService {
  constructor(private prisma: PrismaService) {}

  // [C#] GetPerformanceHistory 이식 (Time Bucket 쿼리)
  async getHistory(startDate: string, endDate: string, eqpids: string, intervalSeconds: number = 300) {
    if (!eqpids) return [];
    if (intervalSeconds <= 0) intervalSeconds = 1; // 0 나누기 방지

    const eqpIdArray = eqpids.split(',').map(id => id.trim());

    // PostgreSQL의 floor(extract(epoch...)) 로직을 사용하여 시간 간격별로 그룹화
    const results = await this.prisma.$queryRawUnsafe<any[]>(`
        SELECT
            eqpid,
            (to_timestamp(floor((extract('epoch' from serv_ts) / ${intervalSeconds} )) * ${intervalSeconds})) as "Timestamp",
            AVG(cpu_usage) as "CpuUsage",
            AVG(mem_usage) as "MemoryUsage",
            AVG(cpu_temp) as "CpuTemp",
            AVG(gpu_temp) as "GpuTemp",
            AVG(fan_speed) as "FanSpeed"
        FROM public.eqp_perf
        WHERE eqpid IN (${eqpIdArray.map(id => `'${id}'`).join(',')})
          AND serv_ts >= '${startDate}'
          AND serv_ts <= '${endDate}'
        GROUP BY eqpid, "Timestamp"
        ORDER BY eqpid, "Timestamp"
    `);

    return results.map(r => ({
      eqpId: r.eqpid,
      timestamp: r.Timestamp,
      cpuUsage: r.CpuUsage,
      memoryUsage: r.MemoryUsage,
      cpuTemp: r.CpuTemp,
      gpuTemp: r.GpuTemp,
      fanSpeed: r.FanSpeed
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

    const results = await this.prisma.$queryRawUnsafe<any[]>(`
        SELECT
            (to_timestamp(floor((extract('epoch' from serv_ts) / ${intervalSeconds} )) * ${intervalSeconds})) as "Timestamp",
            process_name as "ProcessName",
            AVG(memory_usage_mb) as "MemoryUsageMB"
        FROM public.eqp_proc_perf
        WHERE eqpid = '${eqpId}'
          AND serv_ts >= '${startDate}'
          AND serv_ts <= '${endDate}'
        GROUP BY "Timestamp", process_name
        ORDER BY "Timestamp", "MemoryUsageMB" DESC
    `);

    return results.map(r => ({
      timestamp: r.Timestamp,
      processName: r.ProcessName,
      memoryUsageMB: r.MemoryUsageMB
    }));
  }
}
