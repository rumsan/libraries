export type PermissionSet = {
  [subject: string]: ('manage' | 'create' | 'read' | 'update' | 'delete')[];
};

export type UserDataToValidate = {
  email?: string;
  phone?: string;
  wallet?: string;
  username?: string;
};
