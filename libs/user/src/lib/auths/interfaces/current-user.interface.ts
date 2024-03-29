export interface CurrentUserInterface {
  id: number;
  userId: number;
  uuid: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  wallet: string | null;
  roles: string[];
  permissions: {
    action: string;
    subject: string;
    inverted: boolean;
    conditions: string;
  }[];
}

export interface CUI extends CurrentUserInterface {}
