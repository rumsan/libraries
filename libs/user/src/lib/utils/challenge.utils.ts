import { createId } from '@paralleldrive/cuid2';
import { Challenge, CreateChallenge } from '@rumsan/sdk/types';
import { DateUtils } from '@rumsan/sdk/utils';
import { decrypt, encrypt } from './crypto.utils';
const ERRORS = {
  NO_SECRET: 'WalletUtils: Must send secret in to generate challenge data.',
  EXPIRED: 'WalletUtils: Challenge has expired.',
};

export function createChallenge(
  secret: string,
  challengeData: CreateChallenge,
) {
  if (!secret) throw new Error(ERRORS.NO_SECRET);

  const payload: Challenge = {
    clientId: challengeData.clientId || createId(),
    timestamp: DateUtils.getUnixTimestamp(),
    ip: challengeData.ip || null,
    address: challengeData.address || null,
    data: challengeData.data || {},
  };

  const payloadArray: any = [
    payload.clientId,
    payload.timestamp,
    payload.ip,
    payload.address,
    payload.data,
  ];

  return {
    clientId: payload.clientId,
    ip: challengeData.ip,
    challenge: encrypt(JSON.stringify(payloadArray), secret),
  };
}

export function decryptChallenge(
  secret: string,
  challenge: string,
  validationDurationInSeconds: number = 300,
): Challenge {
  if (!secret) throw new Error(ERRORS.NO_SECRET);

  const [clientId, timestamp, ip, address, data] = JSON.parse(
    decrypt(challenge, secret),
  );
  const payload: Challenge = {
    clientId,
    timestamp,
    ip,
    address,
    data,
  };

  if (
    payload.timestamp + validationDurationInSeconds <
    DateUtils.getUnixTimestamp()
  )
    throw new Error(ERRORS.EXPIRED);

  return payload;
}
