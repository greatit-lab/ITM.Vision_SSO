// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // [추가]
import { PrismaService } from './prisma.service';

// Modules
import { EquipmentModule } from './equipment/equipment.module';
import { PreAlignModule } from './prealign/prealign.module';
import { LampLifeModule } from './lamplife/lamplife.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';

// Controllers & Services
import { DashboardController } from './dashboard/dashboard.controller';
import { DashboardService } from './dashboard/dashboard.service';
import { PerformanceController } from './performance/performance.controller';
import { PerformanceService } from './performance/performance.service';
import { ErrorController } from './error/error.controller';
import { ErrorService } from './error/error.service';
import { FiltersController } from './filters/filters.controller';
import { FiltersService } from './filters/filters.service';
import { WaferController } from './wafer/wafer.controller';
import { WaferService } from './wafer/wafer.service';

@Module({
  imports: [
    // [추가] 환경 변수 설정 모듈
    ConfigModule.forRoot({
      isGlobal: true, // 모든 모듈에서 접근 가능하게 설정
      // NODE_ENV가 'production'이면 .env.production, 아니면 .env.development 로드
      envFilePath: process.env.NODE_ENV === 'production' 
        ? '.env.production' 
        : '.env.development',
    }),
    EquipmentModule, 
    PreAlignModule, 
    LampLifeModule, 
    HealthModule,
    AuthModule,
  ],
  controllers: [
    DashboardController,
    PerformanceController,
    ErrorController,
    FiltersController,
    WaferController,
  ],
  providers: [
    PrismaService,
    DashboardService,
    PerformanceService,
    ErrorService,
    FiltersService,
    WaferService,
  ],
})
export class AppModule {}
