import {
  Body,
  Controller,
  HttpCode,
  INestApplication,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Throttle, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { RsExceptionFilter } from '@rumsan/extensions/exceptions';
import { AddressInfo } from 'net';
import {
  envLimit,
  ONE_MINUTE_MS,
  RS_AUTH_THROTTLERS,
  ThrottleTarget,
} from './auth-throttle';

const TEST_ENV_KEY = 'RATE_LIMIT_TEST_ROUTE';

@Controller()
class TestController {
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: ONE_MINUTE_MS } })
  @HttpCode(200)
  @Post('ip-only')
  ipOnly() {
    return { ok: true };
  }

  // No @Throttle: uses the global `default` throttler (60/min)
  @UseGuards(ThrottlerGuard)
  @HttpCode(200)
  @Post('default-only')
  defaultOnly() {
    return { ok: true };
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: { limit: envLimit(TEST_ENV_KEY, 2), ttl: ONE_MINUTE_MS },
  })
  @HttpCode(200)
  @Post('env-limit')
  envLimited() {
    return { ok: true };
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 100, ttl: ONE_MINUTE_MS } })
  @ThrottleTarget('address', 2, ONE_MINUTE_MS)
  @HttpCode(200)
  @Post('otp')
  otp(@Body() _body: unknown) {
    return { ok: true };
  }
}

describe('auth throttling', () => {
  let app: INestApplication;
  let baseUrl: string;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot(RS_AUTH_THROTTLERS)],
      controllers: [TestController],
    }).compile();
    app = moduleRef.createNestApplication();
    // Nest's default adapter is Express. Not importing @nestjs/platform-express
    // here keeps it out of this library's generated dependencies.
    app.getHttpAdapter().getInstance().set('trust proxy', 1);
    // Same global filter as production, to check the 429 survives it
    app.useGlobalFilters(new RsExceptionFilter());
    await app.listen(0);
    const { port } = app.getHttpServer().address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterEach(async () => {
    delete process.env[TEST_ENV_KEY];
    await app.close();
  });

  const post = (path: string, ip: string, body: object = {}) =>
    fetch(`${baseUrl}/${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
      body: JSON.stringify(body),
    }).then((res) => res.status);

  it('limits per client IP from X-Forwarded-For (trust proxy)', async () => {
    for (let i = 0; i < 3; i++)
      expect(await post('ip-only', '1.1.1.1')).toBe(200);
    expect(await post('ip-only', '1.1.1.1')).toBe(429);
    const res = await fetch(`${baseUrl}/ip-only`, {
      method: 'POST',
      headers: { 'x-forwarded-for': '1.1.1.1' },
    });
    expect(res.status).toBe(429);
    expect(res.headers.get('retry-after')).toBeTruthy();
    expect(await res.json()).toMatchObject({ success: false, statusCode: 429 });
    // A different client behind the same proxy is not affected
    expect(await post('ip-only', '2.2.2.2')).toBe(200);
  });

  it('limits per target address across different IPs', async () => {
    expect(await post('otp', '1.1.1.1', { address: 'a@x.com' })).toBe(200);
    expect(await post('otp', '2.2.2.2', { address: 'A@x.com ' })).toBe(200);
    expect(await post('otp', '3.3.3.3', { address: 'a@x.com' })).toBe(429);
    // Other addresses are unaffected
    expect(await post('otp', '3.3.3.3', { address: 'b@x.com' })).toBe(200);
  });

  it('does not apply the target limit to routes without @ThrottleTarget', async () => {
    // 6 requests for one address from different IPs: above the default target
    // limit (5), so a 429 here would mean the target throttler leaked in
    for (let i = 0; i < 6; i++)
      expect(await post('ip-only', `9.9.9.${i}`, { address: 'a@x.com' })).toBe(
        200,
      );
  });

  it('applies the global default limit to routes without @Throttle', async () => {
    for (let i = 0; i < 60; i++)
      expect(await post('default-only', '4.4.4.4')).toBe(200);
    expect(await post('default-only', '4.4.4.4')).toBe(429);
  });

  it('uses the fallback limit when the env variable is not set', async () => {
    for (let i = 0; i < 2; i++)
      expect(await post('env-limit', '5.5.5.5')).toBe(200);
    expect(await post('env-limit', '5.5.5.5')).toBe(429);
  });

  it('reads the limit from env at request time, after the app has started', async () => {
    process.env[TEST_ENV_KEY] = '4';
    for (let i = 0; i < 4; i++)
      expect(await post('env-limit', '6.6.6.6')).toBe(200);
    expect(await post('env-limit', '6.6.6.6')).toBe(429);
  });
});

describe('envLimit', () => {
  const KEY = 'RATE_LIMIT_ENV_LIMIT_SPEC';

  afterEach(() => {
    delete process.env[KEY];
  });

  it('returns the env value when it is a positive integer', () => {
    process.env[KEY] = '15';
    expect(envLimit(KEY, 20)()).toBe(15);
  });

  it.each([undefined, '', 'abc', '0', '-5', '2.5'])(
    'returns the fallback for %p',
    (value) => {
      if (value !== undefined) process.env[KEY] = value;
      expect(envLimit(KEY, 20)()).toBe(20);
    },
  );

  it('picks up env changes made after the decorator was created', () => {
    const limit = envLimit(KEY, 20);
    expect(limit()).toBe(20);
    process.env[KEY] = '7';
    expect(limit()).toBe(7);
  });
});
