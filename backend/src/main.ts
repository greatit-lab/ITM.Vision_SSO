import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS 설정: Vue 프론트엔드(5173)에서 오는 요청 허용
  app.enableCors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // [확인] NestJS는 3000번 포트에서 실행됩니다.
  await app.listen(3000);
}

bootstrap().catch(err => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
