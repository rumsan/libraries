interface Config {
  HOST: string;
  PORT: number;
  SECURE: boolean;
  PASSWORD: string;
  USERNAME: string;
}

export type UpdateSetting = {
  [key: string]: Config | null;
};

export type Setting = {
  name: string;
  value: Record<string, any>;
  dataType?: string;
  requiredFields?: string[];
  isReadOnly?: boolean;
  isPrivate?: boolean;
};
export type SettingList = {
  sucess: boolean;
  data: any;
};

export type SettingResponse = {
  name: string;
  value: any;
  dataType: string;
  requiredFields: string[];
  isReadOnly: boolean;
  isPrivate: boolean;
};
