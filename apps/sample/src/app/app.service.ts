import { Injectable } from '@nestjs/common';
import { PrismaService, UserPrismaWithAudit } from '@rumsan/prisma';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}
  async getData() {
    return UserPrismaWithAudit.update(this.prisma, 1, {
      data: {
        name: 'testUse22sdr',
      },
      where: {
        id: 6,
      },
    });
    //throw ERRORS.NO_MATCH_IP;
    //return AbilitySubject.list();
    //const d = await this.prisma.user.findMany();
    // console.log(SettingsService.get('SMTP.USERNAME'));
    // return 'sss';
  }
}
