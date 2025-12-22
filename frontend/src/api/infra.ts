// frontend/src/api/infra.ts
import http from "./http";

// 1. SDWT (ref_sdwt)
export const getInfraSdwt = () => http.get("/infra/sdwt");

// 2. New Server Config (cfg_new_server)
export const getNewServers = () => http.get("/infra/new-server");
export const createNewServer = (data: any) =>
  http.post("/infra/new-server", data);
export const updateNewServer = (id: number, data: any) =>
  http.put(`/infra/new-server/${id}`, data);
export const deleteNewServer = (id: number) =>
  http.delete(`/infra/new-server/${id}`);

// 3. Agent Server Config (cfg_server)
export const getAgentServers = () => http.get("/infra/agent-server");
export const createAgentServer = (data: any) =>
  http.post("/infra/agent-server", data);
export const updateAgentServer = (id: string, data: any) =>
  http.put(`/infra/agent-server/${id}`, data);
export const deleteAgentServer = (id: string) =>
  http.delete(`/infra/agent-server/${id}`);
