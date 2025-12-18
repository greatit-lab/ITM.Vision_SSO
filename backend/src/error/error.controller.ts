// backend/src/error/error.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { ErrorService } from './error.service';

// [수정] main.ts의 Global Prefix('api')와 중복되지 않도록 'api/' 제거
// 변경 전: @Controller('api/ErrorAnalytics')
// 변경 후: @Controller('ErrorAnalytics')
@Controller('ErrorAnalytics') 
export class ErrorController {
  constructor(private readonly errorService: ErrorService) {}

  @Get('summary')
  getSummary(@Query() query: any) { return this.errorService.getSummary(query); }

  @Get('trend')
  getTrend(@Query() query: any) { return this.errorService.getTrend(query); }

  @Get('logs')
  getLogs(@Query() query: any) { return this.errorService.getLogs(query); }
}
