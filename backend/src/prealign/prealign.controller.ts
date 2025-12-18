// backend/src/prealign/prealign.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { PreAlignService } from './prealign.service';

// [수정] main.ts에서 setGlobalPrefix('api')를 사용하므로, 여기서 'api/'를 제거해야 합니다.
// 변경 전: @Controller('api/PreAlignAnalytics')
// 변경 후: @Controller('PreAlignAnalytics')
@Controller('PreAlignAnalytics') 
export class PreAlignController {
  constructor(private readonly preAlignService: PreAlignService) {}

  @Get('data')
  getData(
    @Query('eqpid') eqpId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.preAlignService.getData(eqpId, startDate, endDate);
  }
}
