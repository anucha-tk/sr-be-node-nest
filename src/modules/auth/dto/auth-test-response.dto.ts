import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty({ example: 'Success message' })
  message: string;
}

export class KeycloakUserDto {
  @ApiProperty({ example: '550e8400-e29b-411d-a516-446255440000' })
  sub: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'jdoe' })
  preferred_username: string;

  @ApiProperty({ example: ['admin', 'supplier'], isArray: true })
  roles: string[];
}

export class AuthTestResponseDto extends MessageResponseDto {
  @ApiProperty({ type: KeycloakUserDto })
  user: KeycloakUserDto;
}
