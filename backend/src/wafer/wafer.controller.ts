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

  // ▼▼▼ [수정] PDF 이미지 엔드포인트 구현 ▼▼▼
  @Get('pdfimage')
  async getPdfImage(@Query() query: WaferQueryParams) {
    // 서비스에서 Base64 문자열을 받아 클라이언트에 그대로 반환
    return await this.waferService.getPdfImage(query);
  }
}
