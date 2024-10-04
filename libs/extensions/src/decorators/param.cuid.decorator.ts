import { ApiParam } from '@nestjs/swagger';

export function ApiCuidParam() {
  return ApiParam({
    name: 'cuid',
    required: true,
    description: 'Unique identifier',
    type: String,
  });
}
