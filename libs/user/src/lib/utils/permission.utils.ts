import { Permission } from '@prisma/client';
import { AbilitySubject } from '../ability/ability.subjects';
import { ERRORS } from '../constants';
import { PermissionSet } from '../interfaces';

export function isPermissionSet(variable: any): variable is PermissionSet {
  if (typeof variable !== 'object' || variable === null) {
    return false;
  }

  for (const key in variable) {
    if (
      !Array.isArray(variable[key]) ||
      !variable[key].every((value: any) =>
        ['manage', 'create', 'read', 'update', 'delete'].includes(value),
      )
    ) {
      return false;
    }
  }

  return true;
}

export function checkPermissionSet(permissions: PermissionSet) {
  if (!permissions) {
    return {
      isValid: true,
      validSubjects: AbilitySubject.listArray(),
    };
  }
  if (!isPermissionSet(permissions)) throw ERRORS.PERMISSION_SET_INVALID;
  return AbilitySubject.checkForValidSubjects(Object.keys(permissions));
}

export function convertToPermissionSet(permissions: Permission[]): {
  [subject: string]: string[];
} {
  console.log(permissions);
  const result: { [subject: string]: string[] } = {};

  permissions.forEach((permission) => {
    const { subject, action } = permission;

    if (!result[subject]) {
      result[subject] = [];
    }

    result[subject].push(action);
  });

  return result;
}
