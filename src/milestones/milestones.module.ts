import { Module } from '@nestjs/common';
import { GoalMilestonesController, MilestonesController } from './milestones.controller';
import { MilestonesService } from './milestones.service';

@Module({ controllers: [GoalMilestonesController, MilestonesController], providers: [MilestonesService] })
export class MilestonesModule {}
