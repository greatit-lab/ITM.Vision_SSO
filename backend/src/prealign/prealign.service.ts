// backend/src/prealign/prealign.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface PreAlignDataRaw {
  timestamp: Date;
  xmm: number;
  ymm: number;
  notch: number;
}

@Injectable()
export class PreAlignService {
  constructor(private prisma: PrismaService) {}

  async getData(eqpId: string, startDate: string, endDate: string) {
    // 날짜 문자열을 Date 객체로 변환
    const start = new Date(startDate);
    const end = new Date(endDate);

    // SQL 쿼리 실행 (public.plg_prealign 테이블)
    const results = await this.prisma.$queryRawUnsafe<PreAlignDataRaw[]>(
      `
      SELECT serv_ts as "timestamp", xmm, ymm, notch
      FROM public.plg_prealign
      WHERE eqpid = $1
        AND serv_ts >= $2
        AND serv_ts <= $3
      ORDER BY serv_ts ASC
      `,
      eqpId,
      start,
      end,
    );

    // 프론트엔드 DTO 형식에 맞춰 매핑
    return results.map((r) => ({
      timestamp: r.timestamp,
      xmm: r.xmm || 0,
      ymm: r.ymm || 0,
      notch: r.notch || 0,
    }));
  }
}
