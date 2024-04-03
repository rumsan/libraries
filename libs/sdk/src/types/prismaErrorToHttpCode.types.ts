import { StatusCodes } from 'http-status-codes';

export type PrismaErrorToHttpCodeMap = Record<string, StatusCodes>;
