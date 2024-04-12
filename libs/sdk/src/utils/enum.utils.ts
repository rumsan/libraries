import { Gender, Service } from '../enums';
import { toProperCase } from './string.utils';

export function enumToObjectArray(
  enumObject: any,
): { label: string; value: string }[] {
  const array = [];
  for (const key in enumObject) {
    if (enumObject.hasOwnProperty(key)) {
      array.push({ label: toProperCase(key), value: enumObject[key] });
    }
  }
  return array.sort((a, b) => a.label.localeCompare(b.label));
}

export function enumToArray(enumObject: any): string[] {
  const array = [];
  for (const key in enumObject) {
    if (enumObject.hasOwnProperty(key)) {
      array.push(enumObject[key]);
    }
  }
  return array.sort();
}

export const listGenders = () => enumToArray(Gender);
export const listServices = () => enumToArray(Service);
