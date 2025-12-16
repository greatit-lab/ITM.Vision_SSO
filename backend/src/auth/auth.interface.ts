// backend/src/auth/auth.interface.ts
export interface User {
  userId: string;
  email: string;
  name: string;
  groups: string | string[];
  sessionIndex?: string;
  department: string;
}

export interface LoginResult {
  access_token: string;
  user: User;
}
