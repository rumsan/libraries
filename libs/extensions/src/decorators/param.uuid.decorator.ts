import { ApiParam } from '@nestjs/swagger';

export function ApiUuidParam() {
  return ApiParam({
    name: 'uuid',
    required: true,
    description: 'Unique identifier',
    type: String,
  });
}
