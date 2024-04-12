import { Service } from '../enums';

export type OTP = {
  address: string;
  service?: Service | null;
  clientId?: string;
};
