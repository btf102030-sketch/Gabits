import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateOnboardingDto } from './dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private svc: UsersService) {}

  @Get('me')
  me(@CurrentUser() u: { id: string }) { return this.svc.me(u.id); }

  @Patch('me/onboarding')
  updateOnboarding(@CurrentUser() u: { id: string }, @Body() dto: UpdateOnboardingDto) {
    return this.svc.updateOnboarding(u.id, dto);
  }
}
