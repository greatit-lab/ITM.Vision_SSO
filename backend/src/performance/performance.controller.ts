// backend/src/performance/performance.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { PerformanceService } from './performance.service';

// [수정] 'api/PerformanceAnalytics' -> 'PerformanceAnalytics'
// 프론트엔드 프록시가 '/api'를 제거하고 호출하므로, 백엔드에서는 'PerformanceAnalytics'로 받아야 합니다.
// (만약 NestJS Global Prefix가 'api'로 설정되어 있다면 더더욱 여기서 'api/'를 빼야 합니다.)
@Controller('PerformanceAnalytics')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  // History 조회
  @Get('history')
  getHistory(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('eqpids') eqpids: string,
    @Query('intervalSeconds') intervalSeconds?: string,
  ) {
    const interval = intervalSeconds ? parseInt(intervalSeconds, 10) : 300;
    return this.performanceService.getHistory(
      startDate,
      endDate,
      eqpids,
      interval,
    );
  }

  // Process History 조회
  @Get('process-history')
  getProcessHistory(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('eqpid') eqpId: string,
    @Query('intervalSeconds') intervalSeconds?: string,
  ) {
    return this.performanceService.getProcessHistory(
      startDate,
      endDate,
      eqpId,
      intervalSeconds ? Number(intervalSeconds) : undefined,
    );
  }
}
