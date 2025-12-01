// backend/src/wafer/wafer.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

export class WaferQueryParams {
  eqpId?: string;
  lotId?: string;
  waferId?: string | number;
  startDate?: string | Date;
  endDate?: string | Date;
  cassetteRcp?: string;
  stageRcp?: string;
  stageGroup?: string;
  film?: string;
  page?: string | number;
  pageSize?: string | number;
  servTs?: string | Date;
}

interface StatsRawResult {
  t1_max: number | null;
  t1_min: number | null;
  t1_mean: number | null;
  t1_std: number | null;
  gof_max: number | null;
  gof_min: number | null;
  gof_mean: number | null;
  gof_std: number | null;
  z_max: number | null;
  z_min: number | null;
  z_mean: number | null;
  z_std: number | null;
  s_max: number | null;
  s_min: number | null;
  s_mean: number | null;
  s_std: number | null;
  [key: string]: number | null;
}

interface PdfResult {
  file_uri: string;
}

@Injectable()
export class WaferService {
  constructor(private prisma: PrismaService) {}

  async getFlatData(params: WaferQueryParams) {
    const {
      eqpId,
      lotId,
      waferId,
      startDate,
      endDate,
      cassetteRcp,
      stageRcp,
      stageGroup,
      film,
      page = 0,
      pageSize = 20,
    } = params;

    const where: Prisma.PlgWfFlatWhereInput = {
      eqpid: eqpId || undefined,
      servTs: {
        gte: startDate ? new Date(startDate) : undefined,
        lte: endDate ? new Date(endDate) : undefined,
      },
      lotid: lotId ? { contains: lotId, mode: 'insensitive' } : undefined,
      waferid: waferId ? Number(waferId) : undefined,
      cassettercp: cassetteRcp || undefined,
      stagercp: stageRcp || undefined,
      stagegroup: stageGroup || undefined,
      film: film || undefined,
    };

    const [total, items] = await this.prisma.$transaction([
      this.prisma.plgWfFlat.count({ where }),
      this.prisma.plgWfFlat.findMany({
        where,
        take: Number(pageSize),
        skip: Number(page) * Number(pageSize),
        orderBy: { servTs: 'desc' },
        distinct: ['eqpid', 'servTs'],
        select: {
          eqpid: true,
          lotid: true,
          waferid: true,
          servTs: true,
          cassettercp: true,
          stagercp: true,
          stagegroup: true,
          film: true,
        },
      }),
    ]);

    return {
      totalItems: total,
      items: items.map((i) => ({
        eqpId: i.eqpid,
        lotId: i.lotid,
        waferId: i.waferid,
        servTs: i.servTs,
        cassetteRcp: i.cassettercp,
        stageRcp: i.stagercp,
        stageGroup: i.stagegroup,
        film: i.film,
      })),
    };
  }

  async getStatistics(params: WaferQueryParams) {
    const whereSql = this.buildUniqueWhere(params);
    if (!whereSql) return this.getEmptyStatistics();

    try {
      const result = await this.prisma.$queryRawUnsafe<StatsRawResult[]>(`
        SELECT
          MAX(t1) as t1_max, MIN(t1) as t1_min, AVG(t1) as t1_mean, STDDEV_SAMP(t1) as t1_std,
          MAX(gof) as gof_max, MIN(gof) as gof_min, AVG(gof) as gof_mean, STDDEV_SAMP(gof) as gof_std,
          MAX(z) as z_max, MIN(z) as z_min, AVG(z) as z_mean, STDDEV_SAMP(z) as z_std,
          MAX(srvisz) as s_max, MIN(srvisz) as s_min, AVG(srvisz) as s_mean, STDDEV_SAMP(srvisz) as s_std
        FROM public.plg_wf_flat
        ${whereSql}
        LIMIT 1  -- [추가] 혹시 모를 중복 방지
      `);

      const row = result[0] || ({} as StatsRawResult);

      if (row.t1_max === null) return this.getEmptyStatistics();

      const createStatItem = (prefix: string) => {
        const max = Number(row[`${prefix}_max`] || 0);
        const min = Number(row[`${prefix}_min`] || 0);
        const mean = Number(row[`${prefix}_mean`] || 0);
        const std = Number(row[`${prefix}_std`] || 0);
        const range = max - min;
        return {
          max,
          min,
          range,
          mean,
          stdDev: std,
          percentStdDev: mean !== 0 ? (std / mean) * 100 : 0,
          percentNonU: mean !== 0 ? (range / (2 * mean)) * 100 : 0,
        };
      };

      return {
        t1: createStatItem('t1'),
        gof: createStatItem('gof'),
        z: createStatItem('z'),
        srvisz: createStatItem('s'),
      };
    } catch (e) {
      console.error('Error in getStatistics:', e);
      return this.getEmptyStatistics();
    }
  }

  async getPointData(
    params: WaferQueryParams,
  ): Promise<{ headers: string[]; data: unknown[][] }> {
    const whereSql = this.buildUniqueWhere(params);
    if (!whereSql) return { headers: [], data: [] };

    try {
      const rawData = await this.prisma.$queryRawUnsafe<
        Record<string, unknown>[]
      >(`
        SELECT * FROM public.plg_wf_flat ${whereSql} 
        ORDER BY point 
        -- LIMIT 절은 넣지 않음 (포인트 데이터는 여러 행일 수 있으므로)
        -- 대신 whereSql이 충분히 유니크하다고 가정
      `);

      if (!rawData || rawData.length === 0) return { headers: [], data: [] };

      const excludeCols = new Set([
        'eqpid',
        'lotid',
        'waferid',
        'serv_ts',
        'cassettercp',
        'stagercp',
        'stagegroup',
        'film',
      ]);

      const allKeys = new Set<string>();
      rawData.forEach((row) => {
        Object.keys(row).forEach((k) => {
          if (!excludeCols.has(k) && row[k] !== null) allKeys.add(k);
        });
      });

      const headers = Array.from(allKeys).sort();

      if (headers.includes('point')) {
        const idx = headers.indexOf('point');
        headers.splice(idx, 1);
        headers.unshift('point');
      }

      const data = rawData.map((row) => headers.map((h) => row[h]));

      return { headers, data };
    } catch (e) {
      console.error('Error in getPointData:', e);
      return { headers: [], data: [] };
    }
  }

  async checkPdf(params: WaferQueryParams) {
    const { eqpId, servTs } = params;

    if (!eqpId || !servTs) {
      return { exists: false, url: null };
    }

    try {
      const ts = typeof servTs === 'string' ? servTs : servTs.toISOString();

      // [수정] PDF 조회 시에도 오차 범위를 고려하여 1초 이내 데이터 검색
      const result = await this.prisma.$queryRawUnsafe<PdfResult[]>(
        `SELECT file_uri FROM public.plg_wf_map 
         WHERE eqpid = $1 
           AND datetime >= $2::timestamp - interval '1 second'
           AND datetime <= $2::timestamp + interval '1 second'
         LIMIT 1`,
        eqpId,
        ts,
      );

      if (result && result.length > 0 && result[0].file_uri) {
        return { exists: true, url: result[0].file_uri };
      }
    } catch (e) {
      console.warn(`Failed to check PDF for ${eqpId}:`, e);
    }

    return { exists: false, url: null };
  }

  // [수정] 날짜 비교 로직을 대폭 완화하여 데이터 조회 성공률을 높임
  private buildUniqueWhere(p: WaferQueryParams): string | null {
    if (!p.eqpId) return null;

    // 기본 조건: 장비 ID (필수)
    let sql = `WHERE eqpid = '${p.eqpId}'`;

    // 1. [핵심] servTs가 있다면, 앞뒤 1분 범위로 넓게 검색 (타임존/오차 무시)
    if (p.servTs) {
      const ts =
        typeof p.servTs === 'string' ? p.servTs : p.servTs.toISOString();
      sql += ` AND serv_ts >= '${ts}'::timestamp - interval '1 minute'`;
      sql += ` AND serv_ts <= '${ts}'::timestamp + interval '1 minute'`;
    }

    // 2. [핵심] 나머지 식별자들을 모두 조건에 포함하여 유니크성 확보
    if (p.lotId) sql += ` AND lotid = '${p.lotId}'`;
    if (p.waferId) sql += ` AND waferid = ${p.waferId}`;

    // 추가 식별자가 있다면 더 넣어도 됩니다. (예: cassetteRcp 등)
    // 하지만 위 3가지(eqpId, lotId, waferId)와 시간 범위면 충분히 유니크합니다.

    // 3. [안전장치] 만약 servTs가 없거나 파싱 실패 시, 가장 최근 데이터 1개를 가져오도록 정렬 추가 (LIMIT 1은 호출부 쿼리에 있음)
    // 이 메서드는 WHERE 절만 리턴하므로 정렬은 호출하는 SQL에서 처리해야 함.

    return sql;
  }

  private getEmptyStatistics() {
    const emptyItem = {
      max: 0,
      min: 0,
      range: 0,
      mean: 0,
      stdDev: 0,
      percentStdDev: 0,
      percentNonU: 0,
    };
    return { t1: emptyItem, gof: emptyItem, z: emptyItem, srvisz: emptyItem };
  }
}
