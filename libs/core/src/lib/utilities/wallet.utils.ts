import { v4 as uuidv4 } from 'uuid';
import { getUnixTimestamp } from './date.utils';
import { CryptoUtils } from './index';

export interface ChallengeInput {
  address?: string;
  clientId?: string;
  ip?: string;
  data?: any;
}

export interface ChallengePayload {
  clientId: string;
  timestamp: number;
  ip?: string;
  address?: string;
  data?: any;
}

const ERRORS = {
  NO_SECRET: 'WalletUtils: Must send secret in to generate challenge data.',
  EXPIRED: 'WalletUtils: Challenge has expired.',
};

export function createChallenge(secret: string, challengeData: ChallengeInput) {
  if (!secret) throw new Error(ERRORS.NO_SECRET);

  const payload: ChallengePayload = {
    clientId: challengeData.clientId || uuidv4(),
    timestamp: getUnixTimestamp(),
  };

  //convert payload to array
  const payloadArray = [payload.clientId, payload.timestamp];

  if (challengeData.ip) {
    payloadArray.push(challengeData.ip);
    payload.ip = challengeData.ip;
  }
  if (challengeData.address) {
    payloadArray.push(challengeData.address);
    payload.address = challengeData.address;
  }
  if (challengeData.data) {
    payloadArray.push(challengeData.data);
    payload.data = challengeData.data;
  }

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
): ChallengePayload {
  if (!secret) throw new Error(ERRORS.NO_SECRET);

  const [clientId, timestamp, ip, address, data] = JSON.parse(
    CryptoUtils.decrypt(challenge, secret),
  );
  const payload: ChallengePayload = {
    clientId,
    timestamp,
    ip,
    address,
    data,
  };

  if (payload.timestamp + validationDurationInSeconds < getUnixTimestamp())
    throw new Error(ERRORS.EXPIRED);

  return payload;
}
