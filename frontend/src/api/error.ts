// frontend/src/api/error.ts
import http from "./http";

export interface ErrorAnalyticsSummaryDto {
  totalErrorCount: number;
  errorEqpCount: number;
  topErrorId: string;
  topErrorCount: number;
  topErrorLabel: string;
  errorCountByEqp: { label: string; value: number }[];
}

export interface ErrorTrendDataPointDto {
  date: string;
  count: number;
}

export interface ErrorLogDto {
  timeStamp: string;
  eqpId: string;
  errorId: string;
  errorLabel: string;
  errorDesc: string;
  extraMessage1: string;
  extraMessage2: string;
}

export const errorApi = {
  getSummary: async (params: any) => {
    // [수정] apiClient -> http
    const { data } = await http.get<ErrorAnalyticsSummaryDto>(
      "/ErrorAnalytics/summary",
      { params }
    );
    return data;
  },
  getTrend: async (params: any) => {
    // [수정] apiClient -> http
    const { data } = await http.get<ErrorTrendDataPointDto[]>(
      "/ErrorAnalytics/trend",
      { params }
    );
    return data;
  },
  getLogs: async (params: any) => {
    // [수정] apiClient -> http
    const { data } = await http.get<{
      items: ErrorLogDto[];
      totalItems: number;
    }>("/ErrorAnalytics/logs", { params });
    return data;
  },
};
