// frontend/src/api/wafer.ts
import axios from "axios";

// 백엔드 포트 3000번으로 설정
const apiClient = axios.create({
  // 환경 변수(VITE_API_BASE_URL)를 사용하거나, 없으면 상대 경로 '/api'를 사용하도록 수정
  baseURL: (import.meta.env.VITE_API_BASE_URL || "") + "/api",
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

// Spectrum Trend 분석용 DTO (Meta 추가)
export interface SpectrumSeriesDto {
  name: string;
  waferId: number;
  pointId: number;
  data: [number, number][]; // [wavelength, intensity]
  meta?: {
    t1: number;
    gof: number;
    mse: number;
    timestamp: string;
  };
}

// --- API 함수 ---

export const waferApi = {
  // 1. 필터 값 조회
  getDistinctValues: async (field: string, params: any) => {
    const { data } = await apiClient.get<string[]>(`/Filters/${field}`, {
      params,
    });
    return data;
  },

  // 2. Flat Data 조회
  getFlatData: async (params: any) => {
    const { data } = await apiClient.get<{
      items: WaferFlatDataDto[];
      totalItems: number;
    }>("/WaferData/flatdata", { params });
    return data;
  },

  // 3. 통계 데이터 조회
  getStatistics: async (params: any) => {
    const { data } = await apiClient.get<StatisticsDto>(
      "/WaferData/statistics",
      {
        params,
      }
    );
    return data;
  },

  // 4. 포인트 데이터 조회
  getPointData: async (params: any) => {
    const { data } = await apiClient.get<PointDataResponseDto>(
      "/WaferData/pointdata",
      { params }
    );
    return data;
  },

  // 5. PDF 존재 여부 확인
  checkPdf: async (
    eqpId: string,
    lotId: string,
    waferId: number,
    servTs: string
  ) => {
    const dt = typeof servTs === "string" ? servTs : (servTs as unknown as Date).toISOString();
    const { data } = await apiClient.get<{ exists: boolean }>(
      "/WaferData/checkpdf",
      { params: { eqpId, lotId, waferId, servTs: dt } }
    );
    return data.exists;
  },

  // 6. PDF 이미지 Base64 변환 조회
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
    const { data } = await apiClient.get<string>("/WaferData/pdfimage", {
      params,
    });
    return data;
  },

  // 7. 단일 스펙트럼 조회
  getSpectrum: async (params: any) => {
    const { data } = await apiClient.get<SpectrumDto[]>("/WaferData/spectrum", {
      params,
    });
    return data;
  },

  // 8. Residual Map 조회
  getResidualMap: async (params: any) => {
    const { data } = await apiClient.get<ResidualMapDto[]>(
      "/WaferData/residual-map",
      { params }
    );
    return data;
  },

  // 9. Golden Spectrum 조회
  getGoldenSpectrum: async (params: any) => {
    const { data } = await apiClient.get<GoldenSpectrumDto | null>(
      "/WaferData/golden-spectrum",
      { params }
    );
    return data;
  },

  // 10. 사용 가능한 Metric 조회
  getAvailableMetrics: async (params: any) => {
    const { data } = await apiClient.get<string[]>("/WaferData/metrics", {
      params,
    });
    return data;
  },

  // 11. Lot Uniformity Trend 조회
  getLotUniformityTrend: async (params: any) => {
    const { data } = await apiClient.get<LotUniformitySeriesDto[]>(
      "/WaferData/trend",
      { params }
    );
    return data;
  },

  // 12. 실제 포인트 목록 조회
  getPoints: async (params: any) => {
    const { data } = await apiClient.get<string[]>("/WaferData/points", {
      params,
    });
    return data;
  },

  // 13. Spectrum Analysis Trend 조회
  getSpectrumTrend: async (params: any) => {
    const { data } = await apiClient.get<SpectrumSeriesDto[]>(
      "/WaferData/trend/spectrum",
      { params }
    );
    return data;
  },
  
  // [신규] 14. Model Fit(GEN) Spectrum 조회
  getSpectrumGen: async (params: any) => {
    // Backend API 엔드포인트가 /trend/spectrum과 파라미터 구조가 유사하므로
    // 실제 Controller에 매핑된 주소나 getSpectrum을 활용해도 됩니다.
    // 여기서는 getSpectrum 메서드를 재활용하는 방식으로 구현할 수도 있으나,
    // 명시적인 분리를 위해 별도 호출 예시를 남깁니다.
    // (실제 사용 시 Backend Controller에 해당 라우트가 있는지 확인 필요, 없으면 getSpectrum 사용)
    
    // 임시로 기존 spectrum 조회 API 활용 (class=GEN 파라미터는 backend service에서 처리한다고 가정)
    // 하지만 Service 단에서 getSpectrumGen을 별도로 만들었으므로 Controller에도 추가해주는 것이 정석입니다.
    // 편의상 프론트엔드는 /WaferData/spectrum-gen (가상의 엔드포인트)으로 호출합니다.
    const { data } = await apiClient.get<any>("/WaferData/spectrum-gen", { params });
    return data;
  },

  getMatchingEquipments: async (params: any) => {
    const { data } = await apiClient.get<string[]>("/WaferData/matching-eqps", { params });
    return data;
  },

  getComparisonData: async (params: any) => {
    const { data } = await apiClient.get<any[]>("/WaferData/comparison", { params });
    return data;
  },
};


