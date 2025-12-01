// backend/src/equipment/equipment.module.ts
import { Module } from '@nestjs/common';
import { EquipmentController } from './equipment.controller';
import { EquipmentService } from './equipment.service';
import { PrismaService } from '../prisma.service'; // [추가] PrismaService 임포트

@Module({
  controllers: [EquipmentController],
  providers: [
    EquipmentService,
    PrismaService, // [추가] 이 모듈의 Provider 목록에 PrismaService 등록
  ],
})
export class EquipmentModule {}
