// decorators/on-error.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const OnError = (): MethodDecorator =>
  SetMetadata('isErrorListener', true);
