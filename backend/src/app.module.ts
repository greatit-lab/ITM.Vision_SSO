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

// [추가] Wafer Module
import { WaferController } from './wafer/wafer.controller';
import { WaferService } from './wafer/wafer.service';

@Module({
  imports: [],
  controllers: [
    DashboardController,
    PerformanceController,
    ErrorController,
    EquipmentController,
    FiltersController,
    WaferController, // [추가] WaferController 등록
  ],
  providers: [
    PrismaService,
    DashboardService,
    PerformanceService,
    ErrorService,
    EquipmentService,
    FiltersService,
    WaferService, // [추가] WaferService 등록
  ],
})
export class AppModule {}
