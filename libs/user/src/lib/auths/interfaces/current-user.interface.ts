export interface CurrentUserInterface {
  id: number;
  userId: number;
  cuid: string;
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
  sessionId: string;
}

export interface CUI extends CurrentUserInterface {}
