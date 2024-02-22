export type Challenge = {
  clientId: string;
  timestamp: number;
  ip: string | null;
  address: string | null;
  data: Record<string, any>;
};

``;
