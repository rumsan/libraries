export type TResponse<T> = {
    success: boolean;
    data: T;
    message?: string;
    meta?: Record<string, any>;
}