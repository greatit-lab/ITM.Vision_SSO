// frontend/src/api/wafer.ts
import axios from "axios";

// [수정] 백엔드 포트 3000번으로 설정
const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
});

// DTO 정의
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

// [추가] 스펙트럼 데이터 DTO
export interface SpectrumDto {
  class: string;
  wavelengths: number[];
  values: number[];
}

// API 함수
export const waferApi = {
  // 필터 데이터 조회
  getDistinctValues: async (field: string, params: any) => {
    const { data } = await apiClient.get<string[]>(`/Filters/${field}`, {
      params,
    });
    return data;
  },

  // 메인 그리드 데이터 조회
  getFlatData: async (params: any) => {
    const { data } = await apiClient.get<{
      items: WaferFlatDataDto[];
      totalItems: number;
    }>("/WaferData/flatdata", { params });
    return data;
  },

  // 통계 데이터 조회
  getStatistics: async (params: any) => {
    const { data } = await apiClient.get<StatisticsDto>(
      "/WaferData/statistics",
      {
        params,
      }
    );
    return data;
  },

  // 포인트 데이터 조회
  getPointData: async (params: any) => {
    const { data } = await apiClient.get<PointDataResponseDto>(
      "/WaferData/pointdata",
      { params }
    );
    return data;
  },

  // PDF 존재 여부 확인
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

  // PDF 이미지 Base64 데이터 요청
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

  // [추가] Spectrum 데이터 요청 함수
  getSpectrum: async (params: any) => {
    const { data } = await apiClient.get<SpectrumDto[]>("/WaferData/spectrum", {
      params,
    });
    return data;
  },
};
