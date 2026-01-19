import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsFlexiblePhone(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isFlexiblePhone',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;
          // Accept 10-15 digits with optional + prefix
          return /^\+?\d{10,15}$/.test(value);
        },
        defaultMessage() {
          return 'Phone must be 10-15 digits, optionally starting with +';
        },
      },
    });
  };
}
