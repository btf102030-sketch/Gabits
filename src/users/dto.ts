import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateOnboardingDto {
  @ApiPropertyOptional()
  @IsOptional() @IsBoolean()
  onboardingCompleted?: boolean;
}
