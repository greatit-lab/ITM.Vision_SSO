// frontend/src/api/performance.ts
import http from "./http";

export interface ProcessMemoryDataDto {
  timestamp: string;
  processName: string;
  memoryUsageMB: number;
}

// [추가] ITM Agent 데이터 DTO
export interface ItmAgentDataDto {
  timestamp: string;
  eqpId: string;
  memoryUsageMB: number;
}

export const performanceApi = {
  // [기존] 장비 성능 히스토리 조회
  getHistory: async (
    startDate: string,
    endDate: string,
    eqpids: string[],
    intervalSeconds = 300
  ) => {
    const params = {
      startDate,
      endDate,
      eqpids: eqpids.join(","),
      interval: intervalSeconds,
    };
    const { data } = await http.get("/Performance/history", { params });
    return data;
  },

  // [기존] 프로세스별 메모리 히스토리 조회
  getProcessHistory: async (
    startDate: string,
    endDate: string,
    eqpId: string,
    intervalSeconds?: number
  ) => {
    const params = { startDate, endDate, eqpId, interval: intervalSeconds };
    const { data } = await http.get<ProcessMemoryDataDto[]>(
      "/Performance/process/history",
      { params }
    );
    return data;
  },

  // [추가] ITM Agent Trend API 호출
  getItmAgentTrend: async (
    site: string,
    sdwt: string,
    eqpId: string,
    startDate: string,
    endDate: string,
    intervalSeconds?: number
  ) => {
    // eqpId는 선택값이므로 없으면 빈 문자열이나 null로 전달될 수 있음
    const params = { 
      site, 
      sdwt, 
      eqpid: eqpId, 
      startDate, 
      endDate, 
      interval: intervalSeconds 
    };
    const { data } = await http.get<ItmAgentDataDto[]>(
      "/Performance/itm-agent-trend",
      { params }
    );
    return data;
  },
};
