// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';

// Modules
import { EquipmentModule } from './equipment/equipment.module';
import { PreAlignModule } from './prealign/prealign.module';
import { LampLifeModule } from './lamplife/lamplife.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { MenuModule } from './menu/menu.module';
import { PerformanceModule } from './performance/performance.module';
import { WaferModule } from './wafer/wafer.module';
import { AdminModule } from './admin/admin.module'; // [New] Import

// Controllers & Services
import { DashboardController } from './dashboard/dashboard.controller';
import { DashboardService } from './dashboard/dashboard.service';
import { ErrorController } from './error/error.controller';
import { ErrorService } from './error/error.service';
import { FiltersController } from './filters/filters.controller';
import { FiltersService } from './filters/filters.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? '.env.production'
          : '.env.development',
    }),
    EquipmentModule,
    PreAlignModule,
    LampLifeModule,
    HealthModule,
    AuthModule,
    MenuModule,
    PerformanceModule,
    WaferModule,
    AdminModule, // [New] 모듈 등록
  ],
  controllers: [DashboardController, ErrorController, FiltersController],
  providers: [PrismaService, DashboardService, ErrorService, FiltersService],
})
export class AppModule {}
