// backend/src/equipment/equipment.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { EquipmentService } from './equipment.service';

// [수정] 'api/Equipment' -> 'Equipment'
// 프론트엔드/프록시가 '/api'를 제거하고 요청하므로, 백엔드는 'Equipment'로 받아야 합니다.
@Controller('Equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Get('details')
  async getDetails(
    @Query('site') site?: string,
    @Query('sdwt') sdwt?: string,
    @Query('eqpId') eqpId?: string,
  ) {
    return this.equipmentService.getDetails(site, sdwt, eqpId);
  }

  @Get('ids')
  async getEqpIds(
    @Query('site') site?: string,
    @Query('sdwt') sdwt?: string,
    @Query('type') type?: string, // type 파라미터 추가 (Wafer/Agent 등 구분용)
  ) {
    return this.equipmentService.getEqpIds(site, sdwt, type);
  }
}
