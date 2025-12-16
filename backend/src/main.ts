// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // 백엔드는 내부적으로 3000번 포트(HTTP)에서 실행됩니다.
  const port = process.env.PORT || 3000;

  const app = await NestFactory.create(AppModule, {
    // CORS 설정: 프론트엔드(8082)에서의 요청 및 인증 정보(쿠키 등) 허용
    cors: {
      origin: true,
      credentials: true,
    },
  });

  await app.listen(port);
  console.log(`🚀 Backend is running on: http://localhost:${port}`);
}

// 시작 중 에러 발생 시 프로세스 종료 처리 (Floating Promise 해결)
bootstrap().catch((err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
