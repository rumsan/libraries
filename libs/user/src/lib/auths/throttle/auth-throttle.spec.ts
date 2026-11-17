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
  ONE_MINUTE_MS,
  RS_AUTH_THROTTLERS,
  ThrottleTarget,
} from './auth-throttle';

@Controller()
class TestController {
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: ONE_MINUTE_MS } })
  @HttpCode(200)
  @Post('ip-only')
  ipOnly() {
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

  afterEach(() => app.close());

  const post = (path: string, ip: string, body: object = {}) =>
    fetch(`${baseUrl}/${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
      body: JSON.stringify(body),
    }).then((res) => res.status);

  it('limits per client IP from X-Forwarded-For (trust proxy)', async () => {
    for (let i = 0; i < 3; i++) expect(await post('ip-only', '1.1.1.1')).toBe(200);
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
      expect(await post('ip-only', `9.9.9.${i}`, { address: 'a@x.com' })).toBe(200);
  });
});
