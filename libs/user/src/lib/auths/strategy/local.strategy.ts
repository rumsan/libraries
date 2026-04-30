import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { getServiceTypeByAddress } from '../../utils/service.utils';
import { AuthsService } from '../auths.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authsService: AuthsService) {
    super({
      usernameField: 'identifier', // username, email, or phone
      passwordField: 'password',
      passReqToCallback: true, // Pass request to validate method
    });
  }

  async validate(req: any, identifier: string, password: string): Promise<any> {
    // Inject request context for IP and userAgent logging
    this.authsService.request = req;
    
    // Extract service from request body or auto-detect from identifier
    let service = req.body?.service;

    // If service not provided or doesn't match identifier format, auto-detect
    if (!service) {
      try {
        service = getServiceTypeByAddress(identifier);
      } catch (error) {
        // If auto-detection fails, pass undefined to let validateUser handle it
        service = undefined;
      }
    }

    const user = await this.authsService.validateUser(
      identifier,
      password,
      service,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user; // Attached to request.user
  }
}
