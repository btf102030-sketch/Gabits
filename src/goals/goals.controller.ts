import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { GoalsService } from './goals.service';
import { CreateGoalDto, UpdateGoalDto } from './dto';

@ApiTags('goals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('goals')
export class GoalsController {
  constructor(private svc: GoalsService) {}

  @Get() list(@CurrentUser() u: { id: string }) { return this.svc.list(u.id); }
  @Post() create(@CurrentUser() u: { id: string }, @Body() dto: CreateGoalDto) { return this.svc.create(u.id, dto); }
  @Get(':id') get(@CurrentUser() u: { id: string }, @Param('id') id: string) { return this.svc.get(u.id, id); }
  @Patch(':id') update(@CurrentUser() u: { id: string }, @Param('id') id: string, @Body() dto: UpdateGoalDto) { return this.svc.update(u.id, id, dto); }
  @Delete(':id') remove(@CurrentUser() u: { id: string }, @Param('id') id: string) { return this.svc.remove(u.id, id); }
}
