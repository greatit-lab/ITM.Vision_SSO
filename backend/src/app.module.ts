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
// [추가] WaferModule import
import { WaferModule } from './wafer/wafer.module';

// Controllers & Services
import { DashboardController } from './dashboard/dashboard.controller';
import { DashboardService } from './dashboard/dashboard.service';
import { ErrorController } from './error/error.controller';
import { ErrorService } from './error/error.service';
import { FiltersController } from './filters/filters.controller';
import { FiltersService } from './filters/filters.service';
// Wafer 관련 Controller/Service는 제거됨 (Module로 이동)

@Module({
  imports: [
    // 환경 변수 설정 모듈
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
    WaferModule, // [추가] 여기에 모듈 등록
  ],
  controllers: [
    DashboardController,
    ErrorController,
    FiltersController,
    // WaferController 제거됨
  ],
  providers: [
    PrismaService,
    DashboardService,
    ErrorService,
    FiltersService,
    // WaferService 제거됨
  ],
})
export class AppModule {}
