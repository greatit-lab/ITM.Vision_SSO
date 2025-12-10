// backend/src/filters/filters.controller.ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import { FiltersService, FilterQueryDto } from './filters.service';

@Controller('api/Filters')
export class FiltersController {
  constructor(private readonly filtersService: FiltersService) {}

  @Get('sites')
  getSites() {
    return this.filtersService.getSites();
  }

  @Get('sdwts/:site')
  getSdwts(@Param('site') site: string) {
    return this.filtersService.getSdwts(site);
  }

  // [수정] EQPID 조회 시 'type' 쿼리 파라미터 처리 추가
  @Get('eqpids')
  getEqpIds(
    @Query('site') site: string,
    @Query('sdwt') sdwt: string,
    @Query('type') type: string // 데이터 소스 타입 (wafer, performance, agent 등)
  ) {
    return this.filtersService.getEqpIdsBySource(site, sdwt, type);
  }

  @Get(':field')
  getDistinctValues(
    @Param('field') field: string,
    @Query() query: FilterQueryDto,
  ) {
    return this.filtersService.getFilteredDistinctValues(field, query);
  }
}
