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

  async log() {
    this.logger.startProfile('getHello');

    // Debug
    this.logger.debug(
      'I am a debug message!',
      {
        props: {
          foo: 'bar',
          baz: 'qux',
        },
      },
      'getHello',
    );

    // Info
    this.logger.info('I am an info message!', {
      props: {
        foo: 'bar',
        baz: 'qux',
      },
    });

    // Warn
    this.logger.warn('I am a warn message!', {
      props: {
        foo: 'bar',
        baz: 'qux',
      },
      error: new Error('Hello World!'),
    });

    // Error
    this.logger.error('I am an error message!', {
      props: {
        foo: 'bar',
        baz: 'qux',
      },
      error: new Error('Hello World!'),
    });

    // Fatal
    this.logger.fatal('I am a fatal message!', {
      props: {
        foo: 'bar',
        baz: 'qux',
      },
      error: new Error('Hello World!'),
    });

    // Emergency
    this.logger.emergency('I am an emergency message!', {
      props: {
        foo: 'bar',
        baz: 'qux',
      },
      error: new Error('Hello World!'),
    });

    return 'good'
  }
}
