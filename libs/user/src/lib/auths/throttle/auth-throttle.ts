import { applyDecorators, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Throttle, ThrottlerOptions } from '@nestjs/throttler';

export const ONE_MINUTE_MS = 60_000;

/**
 * Throttle limit read from an env variable on each request, falling back to
 * `fallback` when the variable is missing or not a positive integer.
 */
export const envLimit =
  (key: string, fallback: number) => (): number => {
    const value = Number(process.env[key]);
    return Number.isInteger(value) && value > 0 ? value : fallback;
  };

/** Throttler that counts requests per target account instead of per IP. */
export const TARGET_THROTTLER = 'target';
const TARGET_FIELD_KEY = 'rs:throttle-target-field';

const getTargetField = (context: ExecutionContext): string | undefined =>
  Reflect.getMetadata(TARGET_FIELD_KEY, context.getHandler());

/**
 * When passing custom throttler options to RSUserModule (e.g. Redis storage),
 * keep these throttlers: `{ throttlers: RS_AUTH_THROTTLERS, storage }`.
 */
export const RS_AUTH_THROTTLERS: ThrottlerOptions[] = [
  { name: 'default', ttl: ONE_MINUTE_MS, limit: 60 },
  {
    name: TARGET_THROTTLER,
    ttl: 15 * ONE_MINUTE_MS,
    limit: 5,
    skipIf: (context) => !getTargetField(context),
  },
];

/**
 * Limit requests per value of a body field (e.g. the email/phone an OTP is
 * sent to), no matter how many IPs they come from. Stops attackers from
 * flooding one victim or guessing one account from rotating IPs.
 *
 * Guards run before validation pipes, so the body is still raw here.
 */
export const ThrottleTarget = (field: string, limit: number, ttl: number) =>
  applyDecorators(
    SetMetadata(TARGET_FIELD_KEY, field),
    Throttle({
      [TARGET_THROTTLER]: {
        limit,
        ttl,
        getTracker: (req) => {
          const value = req['body']?.[field];
          return typeof value === 'string' && value.trim()
            ? `${field}:${value.trim().toLowerCase()}`
            : `ip:${req['ip']}`;
        },
      },
    }),
  );
