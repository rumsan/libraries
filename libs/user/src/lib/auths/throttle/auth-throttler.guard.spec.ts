import { Controller, HttpCode, INestApplication, Post, UseGuards } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Throttle } from '@nestjs/throttler';
import { AddressInfo } from 'net';
import { RSUserModule } from '../../rsuser-module';
import { ONE_MINUTE_MS } from './auth-throttle';
import { AuthThrottlerGuard } from './auth-throttler.guard';

@Controller()
class TestController {
  @UseGuards(AuthThrottlerGuard)
  @Throttle({ default: { limit: 1, ttl: ONE_MINUTE_MS } })
  @HttpCode(200)
  @Post('login')
  login() {
    return { ok: true };
  }
}

describe('rate limiting is required', () => {
  let app: INestApplication | undefined;

  afterEach(async () => {
    await app?.close().catch(() => undefined);
    app = undefined;
  });

  /**
   * Builds an app like main.ts does. `trustProxy` undefined = main.ts never
   * calls app.set('trust proxy', ...).
   */
  const start = async (imports: any[], trustProxy?: unknown) => {
    const moduleRef = await Test.createTestingModule({
      imports,
      controllers: [TestController],
    }).compile();
    app = moduleRef.createNestApplication({ logger: false });
    if (trustProxy !== undefined) {
      app.getHttpAdapter().getInstance().set('trust proxy', trustProxy);
    }
    await app.listen(0);
    const { port } = app.getHttpServer().address() as AddressInfo;
    return () =>
      fetch(`http://127.0.0.1:${port}/login`, { method: 'POST' }).then((r) => r.status);
  };

  it('rate limits when RSUserModule and trust proxy are configured', async () => {
    const call = await start([RSUserModule.forRoot([])], 1);
    expect([await call(), await call()]).toEqual([200, 429]);
  });

  it('accepts an explicit trust proxy false (app with no proxy)', async () => {
    const call = await start([RSUserModule.forRoot([])], false);
    expect(await call()).toBe(200);
  });

  it('fails at startup when main.ts does not set trust proxy', async () => {
    await expect(start([RSUserModule.forRoot([])])).rejects.toThrow(
      /Trust proxy is not configured/,
    );
  });

  it('fails at startup when ThrottlerModule is not registered', async () => {
    await expect(start([], 1)).rejects.toThrow(/Rate limiting is required/);
  });
});
