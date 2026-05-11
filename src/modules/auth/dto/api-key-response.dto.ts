import { ApiProperty } from '@nestjs/swagger';

export class ApiKeyResponseDto {
  @ApiProperty({ example: '550e8400-e29b-411d-a516-446255440000' })
  id: string;

  @ApiProperty({ example: 'Bank-Integration' })
  name: string;

  @ApiProperty({
    example: ['revenue:read', 'orders:write'],
    description: 'List of authorized scopes',
  })
  scopes: string[];

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-05-11T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-05-11T12:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({
    example: '2026-05-11T12:00:00.000Z',
    nullable: true,
    description: 'Timestamp when the key was revoked',
  })
  revokedAt: Date | null;

  @ApiProperty({
    example: 'sr_key_abc123...',
    description: 'The plain API key (only returned once upon creation)',
  })
  key: string;
}

export class ApiKeyRevokeResponseDto {
  @ApiProperty({ example: '550e8400-e29b-411d-a516-446255440000' })
  id: string;
}
