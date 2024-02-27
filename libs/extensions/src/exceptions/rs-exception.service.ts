import { Inject, Injectable } from '@nestjs/common';
import { RSError } from './rs-errors';

@Injectable()
export class RSExceptionService {
  constructor(
    @Inject('ERRORS') private readonly errors: { [key: string]: RSError },
  ) {}

  getErrorSet() {
    return this.errors;
  }
}
