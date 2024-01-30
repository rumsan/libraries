// decorators/on-message.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const OnMessage = (): MethodDecorator =>
  SetMetadata('isMessageListener', true);
