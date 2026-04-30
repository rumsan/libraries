import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsUsername(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isUsername',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;
          // 3-30 chars, alphanumeric, underscore, dot
          return /^[a-zA-Z0-9_.]{3,30}$/.test(value);
        },
        defaultMessage() {
          return 'Username must be 3-30 characters (letters, numbers, _, .)';
        },
      },
    });
  };
}
