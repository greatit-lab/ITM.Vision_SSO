// backend/src/dashboard/dashboard.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // [수정] 커스텀 가드 임포트

// Global Prefix('api')와 결합되어 최종 URL은 '/api/dashboard'가 됩니다.
@Controller('dashboard')
@UseGuards(JwtAuthGuard) // [수정] AuthGuard('jwt') -> JwtAuthGuard로 변경 (데모 모드 지원)
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
