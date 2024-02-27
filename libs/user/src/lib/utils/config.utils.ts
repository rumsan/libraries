import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
const configService = new ConfigService();

export const getSecret = () => {
  const privateKey = configService.get('PRIVATE_KEY');
  if (!privateKey) {
    throw new Error('No PRIVATE_KEY found in config file');
  }

  const hash = crypto.createHash('sha256');
  hash.update(privateKey);
  return hash.digest('hex');
};
