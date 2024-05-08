import { Injectable } from '@nestjs/common';
import { AuditUser } from '@rumsan/extensions/audits';
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

  postAuditSample(userId: number) {
    return AuditUser.create(
      this.prisma,
      userId,
      // req.user.id,
      {
        data: {
          name: 'Sample',
          email: 'email@email.com',
        },
      },
    );
  }
  patchAuditSample() {
    return AuditUser.update(this.prisma, 1, {
      data: {
        name: 'Sample',
        email: 'email1@gmail.com',
      },
      where: {
        id: 1,
      },
    });
  }
}
