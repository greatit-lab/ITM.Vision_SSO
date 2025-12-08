// backend/src/prealign/prealign.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { PreAlignService } from './prealign.service';

@Controller('api/PreAlignAnalytics')
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
