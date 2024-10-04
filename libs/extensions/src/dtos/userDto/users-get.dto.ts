import { ApiProperty } from '@nestjs/swagger';

export class GetUserDto {
  @ApiProperty({
    example: 'b657ffa0-8ec1-4856-ad7f-00c6b87d9000',
    description: 'Cuid of user',
    required: true,
  })
  cuid: string;
}
