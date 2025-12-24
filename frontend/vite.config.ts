// frontend/vite.config.ts
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import fs from "fs";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      // [수정] 외부 PC 접속 허용 (0.0.0.0은 모든 IP에서의 접근을 허용함)
      host: "0.0.0.0",
      
      // 1. 개발 PC 포트 설정 (8082)
      port: 8082,

      // 2. HTTPS 설정 (받아둔 pfx 파일 사용)
      https: {
        // [주의] pfx 파일 경로와 비밀번호가 정확한지 확인하세요.
        pfx: fs.readFileSync(path.resolve(__dirname, "cert/개발PC_IP.pfx")), 
        passphrase: "password", 
      },

      // 3. 프록시 설정
      proxy: {
        "/api": {
          target: "https://localhost:44364", // 백엔드는 로컬에서 돌므로 localhost 유지
          changeOrigin: true,
          secure: false, // 백엔드 인증서가 사설이어도 허용
        },
      },
    },
  };
});
