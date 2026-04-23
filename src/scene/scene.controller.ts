import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { SceneService } from './scene.service';

@ApiTags('scene')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('scene')
export class SceneController {
  constructor(private svc: SceneService) {}

  @Get('state') state(@CurrentUser() u: { id: string }) { return this.svc.getState(u.id); }
}
