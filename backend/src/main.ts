// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestApplicationOptions } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

// [중요] 한국 시간대(KST)로 설정 (웹 조회 시 시간 차이 해결)
process.env.TZ = 'Asia/Seoul';

async function bootstrap() {
  // NestJS의 httpsOptions 타입을 그대로 사용
  let httpsOptions: NestApplicationOptions['httpsOptions'] = undefined;

  // 개발 환경일 때만 HTTPS 적용
  if (process.env.NODE_ENV !== 'production') {
    // [경로 수정] backend 폴더 실행 기준(process.cwd())에서
    // 상위(../)로 올라가 frontend/cert 폴더의 파일을 찾습니다.
    const keyPath = path.join(process.cwd(), '../frontend/cert/private.key');
    const certPath = path.join(process.cwd(), '../frontend/cert/cert.pem');

    // 파일이 실제로 존재하는지 확인
    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      console.log(`[HTTPS] Found certificates at: ${keyPath}`);
      httpsOptions = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      };
    } else {
      // 파일이 없으면 경고 메시지를 띄우고 HTTP로 실행
      console.warn(`[HTTPS] Certificates not found at: ${keyPath}`);
      console.warn('[HTTPS] Starting in HTTP mode (SAML might fail).');
    }
  }

  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });

  // [중요] Frontend 요청 경로(/api/...)와 일치시키기 위해 Global Prefix 설정
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: true,
    credentials: true,
  });

  // .env.development에 설정된 포트(44364) 사용
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  
  // 로그 출력 시 실제 접속 경로(api 포함) 명시
  console.log(`Application is running on: https://localhost:${port}/api`);
}

void bootstrap();
