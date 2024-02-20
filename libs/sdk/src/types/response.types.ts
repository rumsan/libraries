export type Response<T> = {
  success: boolean;
  data: T;
  code?: string;
  meta?: Record<string, any>;
};
