// frontend/src/api/admin.ts
import http from './http';

// ==========================================
// [User Management] 시스템 사용자 관리
// ==========================================
export const getUsers = () => http.get('/admin/users');

// ==========================================
// [Guest Management] 게스트 관리
// ==========================================
export const getGuests = () => http.get('/admin/guests');

export const addGuest = (data: {
  loginId: string;
  deptCode?: string;
  deptName?: string;
  reason?: string;
  validUntil: string | Date;
}) => http.post('/admin/guests', data);

export const deleteGuest = (loginId: string) => http.delete(`/admin/guests/${loginId}`);

// ==========================================
// [Access Request] 접근 신청 관리
// ==========================================
export const getGuestRequests = () => http.get('/admin/requests');

export const approveGuestRequest = (data: { 
  reqId: number; 
  validUntil: string | Date; 
  approverId: string 
}) => http.post('/admin/requests/approve', data);

export const rejectGuestRequest = (data: { 
  reqId: number; 
  approverId: string 
}) => http.post('/admin/requests/reject', data);

// ==========================================
// [Infra Management] 1. 에러 심각도 (Error Severity)
// ==========================================
export const getSeverities = () => http.get('/admin/severity');

export const addSeverity = (data: {
  errorId: string;
  severity: string;
  description?: string;
}) => http.post('/admin/severity', data);

export const updateSeverity = (errorId: string, data: {
  severity: string;
  description?: string;
}) => http.put(`/admin/severity/${errorId}`, data);

export const deleteSeverity = (errorId: string) => http.delete(`/admin/severity/${errorId}`);

// ==========================================
// [Infra Management] 2. 분석 지표 (Analysis Metrics)
// ==========================================
export const getMetrics = () => http.get('/admin/metrics');

export const addMetric = (data: {
  metricName: string;
  isExcluded: boolean | string;
}) => http.post('/admin/metrics', data);

export const updateMetric = (name: string, data: {
  metricName: string;
  isExcluded: boolean | string;
}) => http.put(`/admin/metrics/${name}`, data);

export const deleteMetric = (name: string) => http.delete(`/admin/metrics/${name}`);

// ==========================================
// [System Config] 1. 신규 서버 설정 (New Server Config)
// ==========================================
export const getNewServerConfig = () => http.get('/admin/new-server');

export const updateNewServerConfig = (data: any) => http.put('/admin/new-server', data);

// ==========================================
// [System Config] 2. Agent 서버 목록 (Server List)
// ==========================================
export const getCfgServers = () => http.get('/admin/servers');

export const addCfgServer = (data: {
  eqpid: string;
  agentDbHost?: string;
  agentFtpHost?: string;
  updateFlag?: string;
}) => http.post('/admin/servers', data);

export const updateCfgServer = (eqpid: string, data: {
  agentDbHost?: string;
  agentFtpHost?: string;
  updateFlag?: string;
}) => http.put(`/admin/servers/${eqpid}`, data);

export const deleteCfgServer = (eqpid: string) => http.delete(`/admin/servers/${eqpid}`);
