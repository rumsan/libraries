import type { Prisma } from '@prisma/client';
import { PRISMA_ERROR_TO_HTTP } from '@rumsan/sdk/constants';

export const handleClientKnownRequestError = (
  error: Prisma.PrismaClientKnownRequestError,
) => {
  if (PRISMA_ERROR_TO_HTTP[error.code]) {
    return {
      statusCode: PRISMA_ERROR_TO_HTTP[error.code],
      message:
        error.meta?.['cause'] ||
        (error.meta?.['message'] as string) ||
        'Internal Server Error.',
    };
  }

  return {
    statusCode: 500,
    message: 'Internal Server Error.',
  };
};

export const handleClientUnknownRequestError = (
  error: Prisma.PrismaClientUnknownRequestError,
) => {
  return {
    statusCode: 'UNKNOWN',
    message: error.message || 'Internal Server Error.',
  };
};
