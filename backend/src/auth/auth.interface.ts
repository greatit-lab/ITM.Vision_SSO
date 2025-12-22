// backend/src/auth/auth.interface.ts

export interface User {
  userId: string;
  email: string;
  name: string;
  department: string;     // 부서 코드 (DeptId)
  departmentName: string; // 부서 명 (DeptName)
  companyCode: string;    // 회사 코드 (CompId)
  companyName: string;    // [추가] 회사 명 (CompName)
  groups: string[];
  role?: string;
  sessionIndex?: string;
  site?: string;
  sdwt?: string;
}

export interface LoginResult {
  access_token: string;
  user: User;
}
