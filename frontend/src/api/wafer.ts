// frontend/src/api/wafer.ts
import http from "./http";

// --- DTO 정의 (기존 유지) ---

export interface WaferFlatDataDto {
  eqpId: string;
  lotId: string;
  waferId: number;
  servTs: string;
  dateTime: string;
  cassetteRcp: string;
  stageRcp: string;
  stageGroup: string;
  film: string;
}

export interface StatisticsDto {
  t1: StatisticItem;
  gof: StatisticItem;
  z: StatisticItem;
  srvisz: StatisticItem;
}

export interface StatisticItem {
  max: number;
  min: number;
  range: number;
  mean: number;
  stdDev: number;
  percentStdDev: number;
  percentNonU: number;
}

export interface PointDataResponseDto {
  headers: string[];
  data: any[][];
}

export interface SpectrumDto {
  class: string;
  wavelengths: number[];
  values: number[];
}

export interface ResidualMapDto {
  point: number;
  x: number;
  y: number;
  residual: number;
}

export interface GoldenSpectrumDto {
  wavelengths: number[];
  values: number[];
}

export interface LotUniformitySeriesDto {
  waferId: number;
  dataPoints: {
    point: number;
    value: number;
    x: number;
    y: number;
    dieRow?: number;
    dieCol?: number;
  }[];
}

export interface SpectrumSeriesDto {
  name: string;
  waferId: number;
  pointId: number;
  data: [number, number][]; 
  meta?: {
    t1: number;
    gof: number;
    mse: number;
    timestamp: string;
  };
}

// [신규] Optical Trend DTO
export interface OpticalTrendDto {
  ts: string;
  lotId: string;
  waferId: string;
  point: number;
  totalIntensity: number;
  peakIntensity: number;
}

// --- API 함수 (apiClient -> http로 변경) ---

export const waferApi = {
  getDistinctValues: async (field: string, params: any) => {
    const { data } = await http.get<string[]>(`/Filters/${field}`, {
      params,
    });
    return data;
  },

  getFlatData: async (params: any) => {
    const { data } = await http.get<{
      items: WaferFlatDataDto[];
      totalItems: number;
    }>("/WaferData/flatdata", { params });
    return data;
  },

  getStatistics: async (params: any) => {
    const { data } = await http.get<StatisticsDto>(
      "/WaferData/statistics",
      { params }
    );
    return data;
  },

  getPointData: async (params: any) => {
    const { data } = await http.get<PointDataResponseDto>(
      "/WaferData/pointdata",
      { params }
    );
    return data;
  },

  checkPdf: async (
    eqpId: string,
    lotId: string,
    waferId: number,
    servTs: string
  ) => {
    const dt = typeof servTs === "string" ? servTs : (servTs as unknown as Date).toISOString();
    const { data } = await http.get<{ exists: boolean }>(
      "/WaferData/checkpdf",
      { params: { eqpId, lotId, waferId, servTs: dt } }
    );
    return data.exists;
  },

  getPdfImageBase64: async (
    eqpId: string,
    lotId: string,
    waferId: number,
    dateTime: string,
    pointNumber: number
  ) => {
    const dt = typeof dateTime === "string" ? dateTime : (dateTime as unknown as Date).toISOString();
    const params = {
      eqpId,
      lotId,
      waferId,
      dateTime: dt,
      pointNumber,
    };
    const { data } = await http.get<string>("/WaferData/pdfimage", {
      params,
    });
    return data;
  },

  getSpectrum: async (params: any) => {
    const { data } = await http.get<SpectrumDto[]>("/WaferData/spectrum", {
      params,
    });
    return data;
  },

  getResidualMap: async (params: any) => {
    const { data } = await http.get<ResidualMapDto[]>(
      "/WaferData/residual-map",
      { params }
    );
    return data;
  },

  getGoldenSpectrum: async (params: any) => {
    const { data } = await http.get<GoldenSpectrumDto | null>(
      "/WaferData/golden-spectrum",
      { params }
    );
    return data;
  },

  getAvailableMetrics: async (params: any) => {
    const { data } = await http.get<string[]>("/WaferData/metrics", {
      params,
    });
    return data;
  },

  getLotUniformityTrend: async (params: any) => {
    const { data } = await http.get<LotUniformitySeriesDto[]>(
      "/WaferData/trend",
      { params }
    );
    return data;
  },

  getPoints: async (params: any) => {
    const { data } = await http.get<string[]>("/WaferData/points", {
      params,
    });
    return data;
  },

  getSpectrumTrend: async (params: any) => {
    const { data } = await http.get<SpectrumSeriesDto[]>(
      "/WaferData/trend/spectrum",
      { params }
    );
    return data;
  },
  
  getSpectrumGen: async (params: any) => {
    const { data } = await http.get<any>("/WaferData/spectrum-gen", { params });
    return data;
  },

  getMatchingEquipments: async (params: any) => {
    const { data } = await http.get<string[]>("/WaferData/matching-eqps", { params });
    return data;
  },

  getComparisonData: async (params: any) => {
    const { data } = await http.get<any[]>("/WaferData/comparison", { params });
    return data;
  },

  // [신규] Optical Trend 데이터 조회
  getOpticalTrend: async (params: any) => {
    const { data } = await http.get<OpticalTrendDto[]>("/WaferData/optical-trend", {
      params,
    });
    return data;
  },
};
