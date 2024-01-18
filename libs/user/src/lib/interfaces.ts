export type PermissionSet = {
  [subject: string]: ('manage' | 'create' | 'read' | 'update' | 'delete')[];
};
