// backend/src/filters/filters.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

// [수정] interface -> class 로 변경 (데코레이터 메타데이터 오류 해결)
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

  async getSites(): Promise<string[]> {
    const results = await this.prisma.$queryRaw<{ site: string }[]>`
      SELECT DISTINCT site FROM public.ref_sdwt WHERE is_use = 'Y' ORDER BY site;
    `;
    return results.map((r) => r.site);
  }

  async getSdwts(site: string): Promise<string[]> {
    const results = await this.prisma.$queryRaw<{ sdwt: string }[]>`
      SELECT DISTINCT sdwt FROM public.ref_sdwt WHERE site = ${site} AND is_use = 'Y' ORDER BY sdwt;
    `;
    return results.map((r) => r.sdwt);
  }

  async getFilteredDistinctValues(
    targetColumn: string,
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

    const allowedColumns = [
      'lotid',
      'waferid',
      'cassettercp',
      'stagercp',
      'stagegroup',
      'film',
    ];
    if (!allowedColumns.includes(targetColumn)) {
      return [];
    }

    let sql = `SELECT DISTINCT "${targetColumn}" FROM public.plg_wf_flat WHERE "${targetColumn}" IS NOT NULL`;

    const params: (string | number | Date)[] = [];
    let paramIndex = 1;

    if (eqpId) {
      sql += ` AND eqpid = $${paramIndex++}`;
      params.push(eqpId);
    }

    if (startDate) {
      sql += ` AND serv_ts >= $${paramIndex++}`;
      params.push(new Date(startDate));
    }

    if (endDate) {
      sql += ` AND serv_ts <= $${paramIndex++}`;
      params.push(new Date(endDate));
    }

    const addCondition = (val: string | undefined, col: string) => {
      if (val && col !== targetColumn) {
        sql += ` AND "${col}" = $${paramIndex++}`;
        params.push(col === 'waferid' ? Number(val) : val);
      }
    };

    addCondition(lotId, 'lotid');
    addCondition(waferId, 'waferid');
    addCondition(cassetteRcp, 'cassettercp');
    addCondition(stageRcp, 'stagercp');
    addCondition(stageGroup, 'stagegroup');
    addCondition(film, 'film');

    sql += ` ORDER BY "${targetColumn}" ASC`;

    try {
      // [수정] Record<string, any> -> Record<string, unknown> 으로 변경하여 any 사용 제거
      const results = await this.prisma.$queryRawUnsafe<
        Record<string, unknown>[]
      >(sql, ...params);

      return (
        results
          .map((r) => r[targetColumn])
          // unknown 타입이므로 명확하게 string | number 인지 체크
          .filter(
            (v): v is string | number =>
              v !== null && v !== '' && v !== undefined,
          )
          .map((v) => String(v))
      );
    } catch (e) {
      console.error(`Error fetching distinct values for ${targetColumn}:`, e);
      return [];
    }
  }
}
