// backend/src/dashboard/dashboard.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';

// [수정] Global Prefix('api')와 결합되어 최종 URL은 '/api/dashboard'가 됩니다.
// 기존 'api/dashboard' -> 'dashboard'로 변경
@Controller('dashboard')
@UseGuards(AuthGuard('jwt')) // JWT 인증 가드 적용 (보안 강화)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  async getSummary(
    @Query('site') site?: string,
    @Query('sdwt') sdwt?: string,
  ) {
    return this.dashboardService.getSummary(site, sdwt);
  }

  @Get('agentstatus')
  async getAgentStatus(
    @Query('site') site?: string,
    @Query('sdwt') sdwt?: string,
  ) {
    return this.dashboardService.getAgentStatus(site, sdwt);
  }
}
