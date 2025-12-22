// frontend/src/api/equipment.ts
import http from "./http";

export interface EquipmentSpecDto {
  eqpId: string;
  type: string;
  pcName: string;
  isOnline: boolean;
  ipAddress: string;
  macAddress: string;
  os: string;
  systemType: string;
  locale: string;
  timezone: string;
  cpu: string;
  memory: string;
  disk: string;
  vga: string;
  lastContact: string | null;
  systemModel: string;
  serialNum: string;
  application: string;
  version: string;
  dbVersion: string;
}

// [New] 인프라 관리용 DTO 추가
export interface InfraEquipmentDto {
  eqpId: string;
  sdwt: string;
  site: string;
  campus: string;
  isUse: string;
}

export type EqpIdType =
  | "wafer"
  | "performance"
  | "process"
  | "error"
  | "prealign"
  | "agent"
  | "all";

export const equipmentApi = {
  getEqpIds: async (site?: string, sdwt?: string, type: EqpIdType = "all") => {
    const params = { site, sdwt, type };
    const { data } = await http.get<string[]>("/Filters/eqpids", {
      params,
    });
    return data;
  },

  getDetails: async (site?: string, sdwt?: string, eqpId?: string) => {
    const params = { site, sdwt, eqpId };
    const { data } = await http.get<EquipmentSpecDto[]>("/Equipment/details", {
      params,
    });
    return data;
  },

  // [New] 인프라 목록 조회 API 추가
  getInfraList: async () => {
    const { data } = await http.get<InfraEquipmentDto[]>("/Equipment/infra");
    return data;
  },
};
