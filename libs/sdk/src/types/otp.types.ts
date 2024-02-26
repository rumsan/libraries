import { Enums } from '../enums';

export type OTP = {
  address: string;
  service?: Enums.Service | null;
  clientId?: string;
};
