// backend/src/lamplife/lamplife.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { LampLifeDto } from '../models/LampLifeDto';

// DB 조회 결과 매핑용 인터페이스
interface LampLifeRaw {
  eqpid: string;
  lamp_id: string;
  lamp_no: number | string; // [수정] lamp_no 추가
  age_hour: number;
  lifespan_hour: number;
  last_changed: Date | null;
}

@Injectable()
export class LampLifeService {
  constructor(private readonly prisma: PrismaService) {}

  async getLampStatus(site: string, sdwt?: string): Promise<LampLifeDto[]> {
    // [수정] 테이블명 변경: public.lamp_life -> public.eqp_lamp_life
    let sql = `
      SELECT
        l.eqpid,
        l.lamp_name as lamp_id,
        l.lamp_no,
        l.age_hour,
        l.lifespan_hour,
        l.last_changed
      FROM public.eqp_lamp_life l
      JOIN public.ref_equipment r ON l.eqpid = r.eqpid
      WHERE 1=1
    `;

    const params: (string | number)[] = [];
    let paramIndex = 1;

    // Site 필터
    if (site) {
      sql += ` AND r.sdwt IN (SELECT sdwt FROM public.ref_sdwt WHERE site = $${paramIndex++})`;
      params.push(site);
    }

    // SDWT 필터
    if (sdwt) {
      sql += ` AND r.sdwt = $${paramIndex++}`;
      params.push(sdwt);
    }

    // [수정] 정렬 기준 변경: eqpid 오름차순, lamp_no 오름차순
    sql += ` ORDER BY l.eqpid ASC, l.lamp_no ASC`;

    try {
      const rawData = await this.prisma.$queryRawUnsafe<LampLifeRaw[]>(
        sql,
        ...params,
      );

      return rawData.map((r) => ({
        eqpId: r.eqpid,
        lampId: r.lamp_id,
        // [수정] lampNo 필드 추가 (DTO에 정의되어 있지 않더라도 JS 객체로 전달됨)
        lampNo: r.lamp_no, 
        // 숫자가 아닐 경우 0으로 처리
        ageHour: Number(r.age_hour) || 0,
        lifespanHour: Number(r.lifespan_hour) || 0,
        // Date -> YYYY-MM-DD 문자열 변환
        lastChanged: r.last_changed
          ? new Date(r.last_changed).toISOString().split('T')[0]
          : null,
        // 필수 필드 servTs 채우기 (데이터가 없으면 현재 시간)
        servTs: r.last_changed
          ? new Date(r.last_changed).toISOString()
          : new Date().toISOString(),
      }));
    } catch (error) {
      // 에러 로그 출력 후 빈 배열 반환하여 프론트엔드 크래시 방지
      console.error('LampLife SQL Error:', error);
      return [];
    }
  }
}
