// backend/src/wafer/wafer.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { WaferService, WaferQueryParams } from './wafer.service';

@Controller('api/WaferData')
export class WaferController {
  constructor(private readonly waferService: WaferService) {}

  @Get('flatdata')
  getFlatData(@Query() query: WaferQueryParams) {
    return this.waferService.getFlatData(query);
  }

  @Get('pointdata')
  getPointData(@Query() query: WaferQueryParams) {
    return this.waferService.getPointData(query);
  }

  @Get('statistics')
  getStatistics(@Query() query: WaferQueryParams) {
    return this.waferService.getStatistics(query);
  }

  @Get('checkpdf')
  checkPdf(@Query() query: WaferQueryParams) {
    return this.waferService.checkPdf(query);
  }

  @Get('pdfimage')
  async getPdfImage(@Query() query: WaferQueryParams) {
    return await this.waferService.getPdfImage(query);
  }

  @Get('spectrum')
  getSpectrum(@Query() query: WaferQueryParams) {
    return this.waferService.getSpectrum(query);
  }

  @Get('residual-map')
  getResidualMap(@Query() query: WaferQueryParams) {
    return this.waferService.getResidualMap(query);
  }

  @Get('golden-spectrum')
  getGoldenSpectrum(@Query() query: WaferQueryParams) {
    return this.waferService.getGoldenSpectrum(query);
  }

  @Get('metrics')
  getAvailableMetrics(@Query() query: WaferQueryParams) {
    return this.waferService.getAvailableMetrics(query);
  }

  @Get('trend')
  getLotUniformityTrend(@Query() query: WaferQueryParams & { metric: string }) {
    return this.waferService.getLotUniformityTrend(query);
  }
}
