import { Inject, Injectable } from '@nestjs/common';
import { Logger, LoggerKey } from '@rumsan/extensions/logger';
import { SettingsService } from '@rumsan/extensions/settings';
import { PrismaService } from '@rumsan/prisma';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService,
    @Inject(LoggerKey) private logger: Logger) { }
  async getData() {
    //throw ERRORS.NO_MATCH_IP;
    //return AbilitySubject.list();
    //const d = await this.prisma.user.findMany();
    console.log(SettingsService.get('SMTP.USERNAME'));
    return 'sss';
  }
}
