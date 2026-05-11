import { ApiProperty } from '@nestjs/swagger';

export class ResponsePaginationDto {
  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 0 })
  offset: number;

  @ApiProperty({ example: 100 })
  total: number;
}

export class ResponseMetaDto {
  @ApiProperty({ example: '2026-05-11T12:00:00.000Z' })
  timestamp: string;

  @ApiProperty({
    example: 4.567,
    description: 'Execution time in milliseconds',
  })
  executionTimeMs: number;

  @ApiProperty({ type: ResponsePaginationDto, nullable: true })
  pagination: ResponsePaginationDto | null;
}

export class ResponseErrorDto {
  @ApiProperty({ example: 'BUSINESS_ERROR_CODE' })
  code: string;

  @ApiProperty({ example: 'Human readable message' })
  message: string;

  @ApiProperty({ example: [], isArray: true })
  details: any[];
}

export class StandardResponseDto<T> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  data: T;

  @ApiProperty({ type: ResponseMetaDto })
  meta: ResponseMetaDto;

  @ApiProperty({ type: ResponseErrorDto, nullable: true })
  error: ResponseErrorDto | null;
}
