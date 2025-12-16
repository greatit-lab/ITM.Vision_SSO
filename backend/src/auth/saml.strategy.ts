// backend/src/auth/saml.strategy.ts
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, SamlConfig, Profile } from '@node-saml/passport-saml';
import { User } from './auth.interface';

interface AdProfile extends Profile {
  'http://schemas.sec.com/2018/05/identity/claims/LoginId'?: string;
  'http://schemas.sec.com/2018/05/identity/claims/CompId'?: string;
  'http://schemas.sec.com/2018/05/identity/claims/DeptName'?: string;
  'http://schemas.sec.com/2018/05/identity/claims/Username'?: string;
  'http://schemas.sec.com/2018/05/identity/claims/Mail'?: string;
  'http://schemas.sec.com/2018/05/identity/claims/UserId'?: string;
  sAMAccountName?: string;
  memberOf?: string | string[];
  cn?: string;
  displayName?: string;
}

@Injectable()
export class SamlStrategy extends PassportStrategy(Strategy, 'saml') {
  private readonly logger = new Logger(SamlStrategy.name);

  constructor() {
    // [수정] process.env 값이 undefined일 경우 빈 문자열('')을 할당하여 타입 오류 방지
    const samlConfig: SamlConfig = {
      entryPoint: process.env.SAML_ENTRY_POINT || '',
      issuer: process.env.SAML_ISSUER || '',
      callbackUrl: process.env.SAML_CALLBACK_URL || '',
      idpCert: process.env.SAML_IDP_CERT || '',
      
      identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified',
      disableRequestedAuthnContext: true,
      signatureAlgorithm: 'sha256',
      acceptedClockSkewMs: -1,
      wantAssertionsSigned: true,
      wantAuthnResponseSigned: false,
      authnRequestBinding: 'HTTP-Redirect',
      logoutUrl: process.env.SAML_LOGOUT_URL || '',
      logoutCallbackUrl: process.env.SAML_CALLBACK_URL || '',
      
      // 개인키 설정 (서명용)
      privateKey: process.env.SAML_SP_PRIVATE_KEY || undefined,
    };

    // [런타임 검사] 필수 설정값이 실제로 비어있으면 에러를 발생시켜 디버깅 유도
    if (!samlConfig.entryPoint || !samlConfig.idpCert || !samlConfig.callbackUrl || !samlConfig.issuer) {
      throw new Error(
        '[SamlStrategy] Critical SAML configuration is missing. Please check your .env.development or .env.production file.',
      );
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    super(samlConfig);
  }

  validate(profile: AdProfile): User {
    if (!profile) {
      this.logger.error('SAML Authentication Failed: No Profile received');
      throw new UnauthorizedException('SAML Authentication Failed: No Profile');
    }

    const userId = 
      profile['http://schemas.sec.com/2018/05/identity/claims/LoginId'] || 
      profile['http://schemas.sec.com/2018/05/identity/claims/UserId'] ||
      profile.nameID || 
      profile.sAMAccountName || 
      '';

    const email = 
      profile['http://schemas.sec.com/2018/05/identity/claims/Mail'] || 
      profile.mail || 
      profile.email || 
      '';

    const name = 
      profile['http://schemas.sec.com/2018/05/identity/claims/Username'] || 
      profile.displayName || 
      profile.cn || 
      '';

    const deptName = profile['http://schemas.sec.com/2018/05/identity/claims/DeptName'] || '';

    const groups = profile.memberOf ? (Array.isArray(profile.memberOf) ? profile.memberOf : [profile.memberOf]) : [];

    const user: User = {
      userId: typeof userId === 'string' ? userId : '',
      email: typeof email === 'string' ? email : '',
      name: typeof name === 'string' ? name : '',
      department: typeof deptName === 'string' ? deptName : '',
      groups: groups,
      sessionIndex: profile.sessionIndex,
    };

    // 로그인 성공 로그
    this.logger.log(`SAML Login Successful: ${user.userId} (${user.name})`);

    return user;
  }

  // 메타데이터 생성 시 공개키 포함
  getServiceProviderMetadata(): string {
    // .env에서 공개키를 가져옵니다.
    let signingCert = process.env.SAML_SP_PUBLIC_CERT || null;
    
    if (signingCert) {
      // 줄바꿈 문자(\n) 처리
      signingCert = signingCert.replace(/\\n/g, '\n');
    }

    const decryptionCert = null; // 암호화용 인증서는 사용하지 않음

    return this.generateServiceProviderMetadata(decryptionCert, signingCert);
  }
}
