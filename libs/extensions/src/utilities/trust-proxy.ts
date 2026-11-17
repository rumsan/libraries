/**
 * Cloudflare edge IP ranges. They change rarely; update if Cloudflare adds ranges.
 */
export const CLOUDFLARE_IPS: readonly string[] = [
  '173.245.48.0/20',
  '103.21.244.0/22',
  '103.22.200.0/22',
  '103.31.4.0/22',
  '141.101.64.0/18',
  '108.162.192.0/18',
  '190.93.240.0/20',
  '188.114.96.0/20',
  '197.234.240.0/22',
  '198.41.128.0/17',
  '162.158.0.0/15',
  '104.16.0.0/13',
  '104.24.0.0/14',
  '172.64.0.0/13',
  '131.0.72.0/22',
  '2400:cb00::/32',
  '2606:4700::/32',
  '2803:f800::/32',
  '2405:b500::/32',
  '2405:8100::/32',
  '2a06:98c0::/29',
  '2c0f:f248::/32',
];

/** Proxies on the same host or private network (nginx, Docker, k8s ingress, cloud LB). */
export const LOCAL_PROXIES: readonly string[] = [
  'loopback',
  'linklocal',
  'uniquelocal',
];

const PRESETS: Record<string, readonly string[]> = {
  cloudflare: CLOUDFLARE_IPS,
  local: LOCAL_PROXIES,
};

export function getTrustProxy(
  value: string | undefined = process.env['TRUST_PROXY'],
): boolean | number | string[] {
  const v = value?.trim().toLowerCase();
  if (!v || v === 'auto') return [...LOCAL_PROXIES, ...CLOUDFLARE_IPS];
  if (v === 'false') return false;
  if (v === 'true') return true;
  if (/^\d+$/.test(v)) return Number(v);
  return v
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .flatMap((s) => PRESETS[s] ?? [s]);
}
