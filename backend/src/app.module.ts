// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';

// --- Feature Modules ---
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module'; // [Fix] 파일 생성 후 오류 해결됨
import { EquipmentModule } from './equipment/equipment.module';
import { ErrorModule } from './error/error.module';
import { FiltersModule } from './filters/filters.module'; // [Fix] 파일 생성 후 오류 해결됨
import { HealthModule } from './health/health.module';
import { LampLifeModule } from './lamplife/lamplife.module'; // [Fix] LamplifeModule -> LampLifeModule
import { MenuModule } from './menu/menu.module';
import { PerformanceModule } from './performance/performance.module';
import { PreAlignModule } from './prealign/prealign.module'; // [Fix] PrealignModule -> PreAlignModule
import { WaferModule } from './wafer/wafer.module';

// [New] Infra Management Module
import { InfraModule } from './infra/infra.module';

@Module({
  imports: [
    // Global Config (Process Env)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development', '.env.production', '.env'],
    }),

    // Business Modules
    AdminModule,
    AuthModule,
    DashboardModule,
    EquipmentModule,
    ErrorModule,
    FiltersModule,
    HealthModule,
    LampLifeModule,
    MenuModule,
    PerformanceModule,
    PreAlignModule,
    WaferModule,

    // [New] Added Module
    InfraModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
