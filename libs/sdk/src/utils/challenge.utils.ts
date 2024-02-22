import { CryptoUtils, DateUtils } from '@rumsan/core';
import { v4 as uuidv4 } from 'uuid';
import { ChallengeDto } from '../dtos';
import { Challenge } from '../types';
const ERRORS = {
  NO_SECRET: 'WalletUtils: Must send secret in to generate challenge data.',
  EXPIRED: 'WalletUtils: Challenge has expired.',
};

export function createChallenge(secret: string, challengeData: ChallengeDto) {
  if (!secret) throw new Error(ERRORS.NO_SECRET);

  const payload: Challenge = {
    clientId: challengeData.clientId || uuidv4(),
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
    challenge: CryptoUtils.encrypt(JSON.stringify(payloadArray), secret),
  };
}

export function decryptChallenge(
  secret: string,
  challenge: string,
  validationDurationInSeconds: number = 300,
): Challenge {
  if (!secret) throw new Error(ERRORS.NO_SECRET);

  const [clientId, timestamp, ip, address, data] = JSON.parse(
    CryptoUtils.decrypt(challenge, secret),
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
