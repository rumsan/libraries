import { Pagination, UserBase } from '../types';

export interface CreateUserDto<T = Record<string, unknown>>
  extends UserBase<T> {}

export interface UpdateUserDto<T = Record<string, unknown>>
  extends Partial<UserBase<T>> {}

export interface ListUserDto<T = Record<string, unknown>>
  extends Pagination<T> {}
