// backend/src/performance/performance.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { PerformanceService } from './performance.service';

@Controller('api/PerformanceAnalytics')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  // ... (getHistory는 기존 유지) ...

  @Get('process-history')
  getProcessHistory(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('eqpid') eqpId: string,
    @Query('intervalSeconds') intervalSeconds?: string, // [추가] 선택적 파라미터
  ) {
    // intervalSeconds가 있으면 숫자로 변환하여 전달
    return this.performanceService.getProcessHistory(
      startDate,
      endDate,
      eqpId,
      intervalSeconds ? Number(intervalSeconds) : undefined,
    );
  }
}
