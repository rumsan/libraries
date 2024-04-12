import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { PrismaService } from '@rumsan/prisma';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { getSecret } from '../../utils/config.utils';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService, private prisma: PrismaService) {
    // Extrac Bearer Token from Authorization header request
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getSecret(),
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async validate(payload: any) {
    return payload; // User is appended to req.user
  }
}
