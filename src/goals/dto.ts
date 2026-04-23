import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { PriorityLevel } from '@prisma/client';

export class CreateGoalDto {
  @ApiProperty() @IsString() @IsNotEmpty() title!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty({ enum: PriorityLevel }) @IsEnum(PriorityLevel) priority!: PriorityLevel;
}

export class UpdateGoalDto {
  @ApiPropertyOptional() @IsOptional() @IsString() title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ enum: PriorityLevel }) @IsOptional() @IsEnum(PriorityLevel) priority?: PriorityLevel;
  @ApiPropertyOptional({ minimum: 0, maximum: 11 }) @IsOptional() @IsInt() @Min(0) @Max(11) vertexIndex?: number;
}
