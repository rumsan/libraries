interface Config {
  HOST: string;
  PORT: number;
  SECURE: boolean;
  PASSWORD: string;
  USERNAME: string;
}

export type UpdateSetting = {
  [key: string]: Config;
};

export type Setting = {
  name: string;
  value: Record<string, any>;
  dataType?: string;
  requiredFields?: string[];
  isReadOnly?: boolean;
  isPrivate?: boolean;
};
