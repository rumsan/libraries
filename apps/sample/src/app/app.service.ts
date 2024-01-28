import { Injectable } from '@nestjs/common';
import { PrismaService } from '@rumsan/prisma';
import { SettingsService } from '@rumsan/settings';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}
  async getData() {
    //throw ERRORS.NO_MATCH_IP;
    //return AbilitySubject.list();
    //const d = await this.prisma.user.findMany();
    console.log(SettingsService.get('ISREADBLE2'));
    return 'sss';
  }
}
