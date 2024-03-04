import { Gender, Service } from '../enums';
import { toProperCase } from './string.utils';

export function enumToArray(
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

export const listGenders = () => enumToArray(Gender);
export const listServices = () => enumToArray(Service);
