// frontend/src/api/wafer.ts
import axios from "axios";

// 백엔드 포트 3000번으로 설정
const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
});

// --- DTO 정의 ---

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

// --- API 함수 ---

export const waferApi = {
  getDistinctValues: async (field: string, params: any) => {
    const { data } = await apiClient.get<string[]>(`/Filters/${field}`, {
      params,
    });
    return data;
  },

  getFlatData: async (params: any) => {
    const { data } = await apiClient.get<{
      items: WaferFlatDataDto[];
      totalItems: number;
    }>("/WaferData/flatdata", { params });
    return data;
  },

  getStatistics: async (params: any) => {
    const { data } = await apiClient.get<StatisticsDto>(
      "/WaferData/statistics",
      {
        params,
      }
    );
    return data;
  },

  getPointData: async (params: any) => {
    const { data } = await apiClient.get<PointDataResponseDto>(
      "/WaferData/pointdata",
      { params }
    );
    return data;
  },

  checkPdf: async (eqpId: string, servTs: string) => {
    const dt =
      typeof servTs === "string"
        ? servTs
        : (servTs as unknown as Date).toISOString();

    const { data } = await apiClient.get<{ exists: boolean }>(
      "/WaferData/checkpdf",
      { params: { eqpId, servTs: dt } }
    );
    return data.exists;
  },

  getPdfImageBase64: async (
    eqpId: string,
    dateTime: string,
    pointNumber: number
  ) => {
    const dt =
      typeof dateTime === "string"
        ? dateTime
        : (dateTime as unknown as Date).toISOString();

    const params = {
      eqpId,
      dateTime: dt,
      pointNumber,
    };

    const { data } = await apiClient.get<string>("/WaferData/pdfimage", {
      params,
    });

    return data;
  },

  getSpectrum: async (params: any) => {
    const { data } = await apiClient.get<SpectrumDto[]>("/WaferData/spectrum", {
      params,
    });
    return data;
  },

  getResidualMap: async (params: any) => {
    const { data } = await apiClient.get<ResidualMapDto[]>(
      "/WaferData/residual-map",
      { params }
    );
    return data;
  },

  getGoldenSpectrum: async (params: any) => {
    const { data } = await apiClient.get<GoldenSpectrumDto | null>(
      "/WaferData/golden-spectrum",
      { params }
    );
    return data;
  },

  getAvailableMetrics: async (params: any) => {
    const { data } = await apiClient.get<string[]>("/WaferData/metrics", {
      params,
    });
    return data;
  },

  getLotUniformityTrend: async (params: any) => {
    const { data } = await apiClient.get<LotUniformitySeriesDto[]>(
      "/WaferData/trend",
      { params }
    );
    return data;
  },
};
