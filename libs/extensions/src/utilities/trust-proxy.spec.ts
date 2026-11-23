import { INestApplication, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CLOUDFLARE_IPS, getTrustProxy, LOCAL_PROXIES } from './trust-proxy';

@Module({})
class EmptyModule {}

describe('getTrustProxy', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [EmptyModule],
    }).compile();
    // Default adapter is Express; @nestjs/platform-express is not imported so
    // it stays out of this library's generated dependencies.
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(() => app.close());

  /** Runs Express's real req.ip logic for a request from `peer`. */
  const clientIp = (trust: ReturnType<typeof getTrustProxy>, peer: string, xff?: string) => {
    const express = app.getHttpAdapter().getInstance();
    express.set('trust proxy', trust);
    const req = Object.create(express.request);
    req.app = express;
    req.headers = xff ? { 'x-forwarded-for': xff } : {};
    req.connection = req.socket = { remoteAddress: peer };
    return req.ip;
  };

  const auto = getTrustProxy(undefined);
  const CF_EDGE = '172.70.10.20'; // inside 172.64.0.0/13

  it('defaults to local proxies + Cloudflare', () => {
    expect(auto).toEqual([...LOCAL_PROXIES, ...CLOUDFLARE_IPS]);
    expect(getTrustProxy('auto')).toEqual(auto);
  });

  it('Cloudflare -> app: uses the client IP Cloudflare added', () => {
    expect(clientIp(auto, CF_EDGE, '203.0.113.5')).toBe('203.0.113.5');
    expect(clientIp(auto, '2606:4700::1', '2001:db8::5')).toBe('2001:db8::5');
  });

  it('Cloudflare -> nginx -> app: skips both proxies', () => {
    expect(clientIp(auto, '127.0.0.1', `203.0.113.5, ${CF_EDGE}`)).toBe('203.0.113.5');
  });

  it('Cloudflare: ignores IPs the client spoofed before Cloudflare', () => {
    expect(clientIp(auto, CF_EDGE, '6.6.6.6, 203.0.113.5')).toBe('203.0.113.5');
  });

  it('no Cloudflare, direct: ignores a spoofed X-Forwarded-For', () => {
    expect(clientIp(auto, '198.51.100.7', '6.6.6.6')).toBe('198.51.100.7');
  });

  it('no Cloudflare, nginx or private LB in front: uses the IP the proxy added', () => {
    expect(clientIp(auto, '127.0.0.1', '198.51.100.7')).toBe('198.51.100.7');
    expect(clientIp(auto, '10.0.1.15', '6.6.6.6, 198.51.100.7')).toBe('198.51.100.7');
  });

  it('parses explicit values', () => {
    expect(getTrustProxy('false')).toBe(false);
    expect(getTrustProxy('true')).toBe(true);
    expect(getTrustProxy('2')).toBe(2);
    expect(getTrustProxy('local, 203.0.113.10')).toEqual([...LOCAL_PROXIES, '203.0.113.10']);
    expect(clientIp(getTrustProxy('false'), '127.0.0.1', '6.6.6.6')).toBe('127.0.0.1');
  });
});
