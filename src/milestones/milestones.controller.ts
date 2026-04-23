import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { MilestonesService } from './milestones.service';
import { CreateMilestoneDto, UpdateMilestoneDto } from './dto';

@ApiTags('milestones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('goals/:goalId/milestones')
export class GoalMilestonesController {
  constructor(private svc: MilestonesService) {}
  @Get() list(@CurrentUser() u: { id: string }, @Param('goalId') goalId: string) { return this.svc.list(u.id, goalId); }
  @Post() create(@CurrentUser() u: { id: string }, @Param('goalId') goalId: string, @Body() dto: CreateMilestoneDto) {
    return this.svc.create(u.id, goalId, dto);
  }
}

@ApiTags('milestones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('milestones')
export class MilestonesController {
  constructor(private svc: MilestonesService) {}
  @Patch(':id') update(@CurrentUser() u: { id: string }, @Param('id') id: string, @Body() dto: UpdateMilestoneDto) {
    return this.svc.update(u.id, id, dto);
  }
  @Delete(':id') remove(@CurrentUser() u: { id: string }, @Param('id') id: string) { return this.svc.remove(u.id, id); }
}
