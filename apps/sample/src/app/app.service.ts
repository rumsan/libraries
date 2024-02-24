import { Injectable } from '@nestjs/common';
import { SettingsService } from '@rumsan/extensions/settings';
import { PrismaService } from '@rumsan/prisma';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}
  async getData() {
    //throw ERRORS.NO_MATCH_IP;
    //return AbilitySubject.list();
    //const d = await this.prisma.user.findMany();
    console.log(SettingsService.get('SMTP.USERNAME'));
    return 'sss';
  }
}
