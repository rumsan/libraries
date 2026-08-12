import { Permission } from '@prisma/client';
import { AbilityAction } from '../ability/ability.actions';
import { AbilitySubject } from '../ability/ability.subjects';
import { ERRORS } from '../constants';
import { RSE } from '../constants/errors';
import { PermissionSet } from '../interfaces';

export function isPermissionSet(variable: any): variable is PermissionSet {
  if (typeof variable !== 'object' || variable === null) {
    return false;
  }

  for (const key in variable) {
    if (
      !Array.isArray(variable[key]) ||
      !variable[key].every(
        (value: any) => AbilityAction.checkForValidActions(value).isValid,
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

export function assertValidPermissionSet(permissions: PermissionSet) {
  const { isValid, validSubjects } = checkPermissionSet(permissions);
  if (!isValid)
    throw RSE(
      `Invalid permission set. Valid subjects are {{validSubjects}}.`,
      'PERMISSION_SET_INVALID',
      400,
      { validSubjects: validSubjects.join(', ') },
    );
}

export function convertToPermissionSet(permissions: Permission[]): {
  [subject: string]: string[];
} {
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
