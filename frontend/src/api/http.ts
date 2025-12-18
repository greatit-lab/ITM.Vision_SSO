// frontend/src/api/http.ts
import axios from "axios";

// [수정] 배포 시 Nginx Proxy를 타도록 상대 경로 혹은 환경변수 사용
const baseURL = (import.meta.env.VITE_API_BASE_URL || "") + "/api";

const http = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// [추가] 요청 인터셉터: 모든 API 요청 헤더에 토큰 자동 주입
http.interceptors.request.use(
  (config) => {
    // localStorage에서 토큰을 가져옴 (AuthStore에서 관리하는 키 이름과 일치해야 함)
    const token = localStorage.getItem("jwt_token");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default http;
