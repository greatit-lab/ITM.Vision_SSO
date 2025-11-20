import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// Dashboard (직접 등록으로 변경)
import { DashboardController } from './dashboard/dashboard.controller';
import { DashboardService } from './dashboard/dashboard.service';

// Other Modules
import { PerformanceController } from './performance/performance.controller';
import { PerformanceService } from './performance/performance.service';
import { ErrorController } from './error/error.controller';
import { ErrorService } from './error/error.service';
import { EquipmentController } from './equipment/equipment.controller';
import { EquipmentService } from './equipment/equipment.service';
import { FiltersController } from './filters/filters.controller';
import { FiltersService } from './filters/filters.service';

@Module({
  imports: [], 
  controllers: [
    DashboardController,      // 추가됨
    PerformanceController, 
    ErrorController, 
    EquipmentController, 
    FiltersController
  ],
  providers: [
    PrismaService, 
    DashboardService,         // 추가됨
    PerformanceService, 
    ErrorService, 
    EquipmentService, 
    FiltersService
  ],
})
export class AppModule {}
