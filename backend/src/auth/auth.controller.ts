// backend/src/auth/auth.controller.ts
import { Controller, Get, Post, Body, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { SamlStrategy } from './saml.strategy';
import type { Response, Request } from 'express';
import { User } from './auth.interface';

interface RequestWithUser extends Request {
  user: User;
}

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private samlStrategy: SamlStrategy,
  ) {}

  // 1. SSO 로그인 시작
  @Get('login')
  @UseGuards(AuthGuard('saml'))
  async login() {
    // Passport 처리
  }

  // 2. SSO 콜백
  @Post('callback')
  @UseGuards(AuthGuard('saml'))
  async callback(@Req() req: RequestWithUser, @Res() res: Response) {
    // .env.FRONTEND_URL이 설정되어 있지 않으면 기본값 사용
    const frontendUrl = process.env.FRONTEND_URL || 'https://localhost:8082/login';

    if (!req.user) {
      return res.redirect(`${frontendUrl}?error=NoUser`);
    }

    const jwtResult = await this.authService.login(req.user);

    const userJson = JSON.stringify(req.user);
    const encodedUser = encodeURIComponent(userJson);

    const redirectUrl = `${frontendUrl}?token=${jwtResult.access_token}&user=${encodedUser}`;
    
    return res.redirect(redirectUrl);
  }

  // 3. 메타데이터 제공
  @Get('metadata')
  getMetadata(@Res() res: Response) {
    try {
      const metadata = this.samlStrategy.getServiceProviderMetadata();
      res.set('Content-Type', 'application/xml');
      res.send(metadata);
    } catch (e) {
      console.error('Metadata generation failed', e);
      res.status(500).send('Failed to generate metadata');
    }
  }

  // [추가] 4. 사용자 Context (Site/SDWT) 저장
  @Post('context')
  @UseGuards(AuthGuard('jwt'))
  async saveContext(
    @Req() req: RequestWithUser,
    @Body() body: { site: string; sdwt: string }
  ) {
    // req.user는 JWT Strategy에 의해 디코딩된 정보
    return await this.authService.saveUserContext(req.user.userId, body.site, body.sdwt);
  }
}
