// backend/src/auth/auth.interface.ts
export interface User {
  userId: string;
  email: string;
  name: string;
  department: string;
  companyCode: string; // [추가] 회사 코드
  groups: string | string[];
  sessionIndex?: string;
}

// 로그인 결과에 Role 정보 추가
export interface LoginResult {
  access_token: string;
  user: User & { role: string }; // [수정] role 포함
}
