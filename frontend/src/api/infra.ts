// frontend/src/api/infra.ts
import http from "./http";

// [추가됨] View에서 호출하는 장비 목록 API (기존 /equipment API 활용)
export const getInfraEquipment = () => http.get("/equipment");

// 1. SDWT (ref_sdwt)
export const getInfraSdwt = () => http.get("/infra/sdwt");

// 3. Agent Server Config (cfg_server)
export const getAgentServers = () => http.get("/infra/agent-server");
export const createAgentServer = (data: any) => http.post("/infra/agent-server", data);
export const updateAgentServer = (id: string, data: any) => http.put(`/infra/agent-server/${id}`, data);
export const deleteAgentServer = (id: string) => http.delete(`/infra/agent-server/${id}`);
