import { Injectable } from '@nestjs/common';
import { PrismaService } from '@rumsan/prisma';
import { AbilitySubject } from '@rumsan/user';
import { ERRORS } from '../constants/errors';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}
  async getData() {
    throw ERRORS.SSS_NO_MATCH_IP;
    return AbilitySubject.list();
    const d = await this.prisma.user.findMany();
    return { message: 'Hello API', data: d };
  }
}
