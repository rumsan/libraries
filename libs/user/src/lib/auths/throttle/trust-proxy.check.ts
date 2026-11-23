import { AbstractHttpAdapter } from '@nestjs/core';

const EXPRESS_TRUST_PROXY_DEFAULT = '@@symbol:trust_proxy_default';

export function assertTrustProxyConfigured(
  httpAdapter?: AbstractHttpAdapter,
): void {
  if (httpAdapter?.getType?.() !== 'express') return;
  const settings = httpAdapter.getInstance()?.settings;
  if (settings?.[EXPRESS_TRUST_PROXY_DEFAULT] === true) {
    throw new Error(
      'Trust proxy is not configured. @rumsan/user rate-limits auth routes by client IP, so main.ts must set it before app.listen():\n' +
        "  import { getTrustProxy } from '@rumsan/extensions/utilities';\n" +
        "  app.set('trust proxy', getTrustProxy());\n" +
        'Use TRUST_PROXY=local for Nginx-only servers (default trusts Cloudflare + local proxies).',
    );
  }
}
