// backend/src/filters/filters.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

// DTO 정의: 프론트엔드에서 넘어오는 모든 필터 조건을 담는 그릇
export class FilterQueryDto {
  eqpId?: string;
  startDate?: string;
  endDate?: string;
  lotId?: string;
  waferId?: string;
  cassetteRcp?: string;
  stageRcp?: string;
  stageGroup?: string;
  film?: string;
}

@Injectable()
export class FiltersService {
  constructor(private prisma: PrismaService) {}

  // 1. Site 목록 조회 (ref_sdwt 테이블 사용)
  async getSites(): Promise<string[]> {
    try {
      const results = await this.prisma.$queryRaw<{ site: string }[]>`
        SELECT DISTINCT site FROM public.ref_sdwt WHERE is_use = 'Y' ORDER BY site;
      `;
      return results.map((r) => r.site);
    } catch (e) {
      console.error('Error fetching sites:', e);
      return [];
    }
  }

  // 2. SDWT 목록 조회 (ref_sdwt 테이블 사용)
  async getSdwts(site: string): Promise<string[]> {
    try {
      const results = await this.prisma.$queryRaw<{ sdwt: string }[]>`
        SELECT DISTINCT sdwt FROM public.ref_sdwt WHERE site = ${site} AND is_use = 'Y' ORDER BY sdwt;
      `;
      return results.map((r) => r.sdwt);
    } catch (e) {
      console.error(`Error fetching sdwts for site ${site}:`, e);
      return [];
    }
  }

  // 3. 통합 필터 값 조회 (plg_wf_flat 테이블 사용)
  // 이 메서드 하나로 Lot, Recipe, Wafer 등 모든 필터 목록을 처리합니다.
  async getFilteredDistinctValues(
    field: string,
    query: FilterQueryDto,
  ): Promise<string[]> {
    const {
      eqpId,
      startDate,
      endDate,
      lotId,
      waferId,
      cassetteRcp,
      stageRcp,
      stageGroup,
      film,
    } = query;

    // [매핑] 프론트엔드 요청(복수형/단수형) -> DB 컬럼명(단수형)
    const columnMap: Record<string, string> = {
      // 복수형 요청 대응
      lotids: 'lotid',
      waferids: 'waferid',
      cassettercps: 'cassettercp',
      stagercps: 'stagercp',
      stagegroups: 'stagegroup',
      films: 'film',
      // 단수형 요청 대응
      lotid: 'lotid',
      waferid: 'waferid',
      cassettercp: 'cassettercp',
      stagercp: 'stagercp',
      stagegroup: 'stagegroup',
      film: 'film',
    };

    // 요청된 field를 DB 컬럼명으로 변환 (없으면 요청명 그대로 사용)
    const targetColumn = columnMap[field.toLowerCase()] || field;

    // [보안] 조회 허용된 컬럼인지 확인 (SQL Injection 방지)
    const allowedColumns = [
      'lotid',
      'waferid',
      'cassettercp',
      'stagercp',
      'stagegroup',
      'film',
    ];

    if (!allowedColumns.includes(targetColumn)) {
      console.warn(`[FiltersService] Unauthorized column access: ${targetColumn}`);
      return [];
    }

    // 기본 SQL 구성
    let sql = `SELECT DISTINCT "${targetColumn}" FROM public.plg_wf_flat WHERE "${targetColumn}" IS NOT NULL`;
    const params: (string | number | Date)[] = [];
    let paramIndex = 1;

    // 3-1. 공통 필터 적용 (EQP ID)
    if (eqpId) {
      sql += ` AND eqpid = $${paramIndex++}`;
      params.push(eqpId);
    }

    // [중요] 날짜 조건 (serv_ts) 적용
    // Lot ID가 같아도 날짜/레시피가 다를 수 있으므로 날짜 범위는 필수적임
    if (startDate) {
      sql += ` AND serv_ts >= $${paramIndex++}`;
      params.push(new Date(startDate));
    }

    if (endDate) {
      sql += ` AND serv_ts <= $${paramIndex++}`;
      params.push(new Date(endDate));
    }

    // 3-2. 계층형(Cascade) 조건 적용 함수
    // "현재 조회하려는 컬럼이 아니고, 값이 존재할 때"만 WHERE 조건에 추가
    const addCondition = (val: string | undefined, col: string) => {
      if (val && col !== targetColumn) {
        sql += ` AND "${col}" = $${paramIndex++}`;
        // waferid는 숫자형으로 변환, 그 외는 문자열
        params.push(col === 'waferid' ? Number(val) : val);
      }
    };

    // 순차적으로 조건 검사 (값이 없으면 무시됨)
    addCondition(lotId, 'lotid');
    addCondition(waferId, 'waferid');
    addCondition(cassetteRcp, 'cassettercp');
    addCondition(stageRcp, 'stagercp');
    addCondition(stageGroup, 'stagegroup');
    addCondition(film, 'film');

    // 정렬 및 개수 제한
    sql += ` ORDER BY "${targetColumn}" ASC LIMIT 500`;

    // [디버깅 로그] 
    // console.log(`[FiltersService] SQL: ${sql}`);
    // console.log(`[FiltersService] Params:`, params);

    try {
      // Raw Query 실행
      const results = await this.prisma.$queryRawUnsafe<Record<string, unknown>[]>(
        sql,
        ...params,
      );

      // 결과 가공 (null 제거 및 문자열 변환)
      return results
        .map((r) => r[targetColumn])
        .filter(
          (v): v is string | number =>
            v !== null && v !== '' && v !== undefined,
        )
        .map((v) => String(v));
    } catch (e) {
      console.error(`[FiltersService] Error fetching ${targetColumn}:`, e);
      return [];
    }
  }
}
