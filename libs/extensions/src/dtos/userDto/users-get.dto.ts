import { ApiProperty } from '@nestjs/swagger';
import { UUID } from 'crypto';

export class GetUserDto {
  @ApiProperty({
    example: 'b657ffa0-8ec1-4856-ad7f-00c6b87d9000',
    description: 'UUID of user',
    required: true,
  })
  uuid: UUID;
}
