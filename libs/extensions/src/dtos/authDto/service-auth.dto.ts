import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO for OAuth2 Client Credentials Flow
 * Used by external services (e.g., SMS Bridge) to authenticate
 */
export class ServiceAuthDto {
  @ApiProperty({
    description: 'Service client ID',
    example: 'clx1234567890abcdef',
  })
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({
    description: 'Service client secret',
    example: 'your-secret-key',
  })
  @IsString()
  @IsNotEmpty()
  clientSecret: string;
}

/**
 * DTO for creating a new service client
 */
export class CreateServiceClientDto {
  @ApiProperty({
    description: 'Name of the service',
    example: 'SMS Bridge',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Description of the service',
    example: 'External SMS gateway bridge service',
    required: false,
  })
  @IsString()
  description?: string;
}
