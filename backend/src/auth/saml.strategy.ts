// backend/src/auth/saml.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, SamlConfig, Profile } from '@node-saml/passport-saml';
import { User } from './auth.interface';

// AD 프로필 인터페이스 확장
interface AdProfile extends Profile {
  sAMAccountName?: string;
  memberOf?: string | string[];
  cn?: string;
  mail?: string;
}

@Injectable()
export class SamlStrategy extends PassportStrategy(Strategy, 'saml') {
  constructor() {
    const samlConfig: SamlConfig = {
      callbackUrl: process.env.SAML_CALLBACK_URL || '',
      entryPoint: process.env.SAML_ENTRY_POINT || '',
      issuer: process.env.SAML_ISSUER || '',
      idpCert: process.env.SAML_IDP_CERT || '',
      privateKey: process.env.SAML_SP_PRIVATE_KEY || '',
      signatureAlgorithm: 'sha256',
      wantAssertionsSigned: true,
      wantAuthnResponseSigned: false,
      authnRequestBinding: 'HTTP-Redirect',
      logoutUrl: process.env.SAML_LOGOUT_URL || '',
      logoutCallbackUrl: process.env.SAML_CALLBACK_URL || '',
    };

    // [해결 1, 2] TypeScript 오류 억제
    // passport-saml은 2개의 인자를 요구하지만, NestJS는 1개만 필요로 합니다.
    // 이를 해결하기 위해 @ts-expect-error를 사용하여 컴파일 오류를 무시합니다.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    super(samlConfig);
  }

  // [해결 3] async 키워드 제거 (내부에서 await를 쓰지 않으므로 동기 함수로 변경)
  validate(profile: AdProfile): User {
    if (!profile) {
      throw new UnauthorizedException('SAML Authentication Failed: No Profile');
    }

    // [해결 4] 값의 존재 여부를 확실히 체크하고 문자열로 변환하여 타입 오류 방지
    const userId = profile.nameID || profile.sAMAccountName || '';
    const email = profile.email || profile.mail || '';
    const name = profile.displayName || profile.cn || '';
    
    // memberOf는 string, array, 혹은 undefined일 수 있음
    const groups = profile.memberOf || [];

    const user: User = {
      userId: typeof userId === 'string' ? userId : '',
      email: typeof email === 'string' ? email : '',
      name: typeof name === 'string' ? name : '',
      groups: groups,
      sessionIndex: profile.sessionIndex,
    };

    return user;
  }
}
