// backend/src/performance/performance.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { PerformanceService } from './performance.service';

// [수정] main.ts의 Global Prefix('api')와 중복되지 않도록 'api/' 제거
// 변경 전: @Controller('api/Performance')
// 변경 후: @Controller('Performance')
@Controller('Performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Get('history')
  getHistory(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('eqpids') eqpids: string,
    @Query('interval') interval: string,
  ) {
    const intervalNum = interval ? parseInt(interval, 10) : 300;
    return this.performanceService.getHistory(
      startDate,
      endDate,
      eqpids,
      intervalNum,
    );
  }

  @Get('process/history')
  getProcessHistory(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('eqpId') eqpId: string,
    @Query('interval') interval: string,
  ) {
    const intervalNum = interval ? parseInt(interval, 10) : 0;
    return this.performanceService.getProcessHistory(
      startDate,
      endDate,
      eqpId,
      intervalNum,
    );
  }

  // [추가] ITM Agent Trend 조회 엔드포인트
  @Get('itm-agent-trend')
  getItmAgentTrend(
    @Query('site') site: string,
    @Query('sdwt') sdwt: string,
    @Query('eqpid') eqpid: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('interval') interval: string,
  ) {
    const intervalNum = interval ? parseInt(interval, 10) : 0;
    return this.performanceService.getItmAgentTrend(
      site,
      sdwt,
      eqpid,
      startDate,
      endDate,
      intervalNum,
    );
  }
}
