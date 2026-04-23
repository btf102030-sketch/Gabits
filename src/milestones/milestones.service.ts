import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMilestoneDto, UpdateMilestoneDto } from './dto';

@Injectable()
export class MilestonesService {
  constructor(private prisma: PrismaService) {}

  private async assertGoalOwner(userId: string, goalId: string) {
    const g = await this.prisma.goal.findUnique({ where: { id: goalId } });
    if (!g) throw new NotFoundException('Goal not found');
    if (g.userId !== userId) throw new ForbiddenException();
  }

  private async assertOwner(userId: string, id: string) {
    const m = await this.prisma.milestone.findUnique({ where: { id }, include: { goal: true } });
    if (!m) throw new NotFoundException('Milestone not found');
    if (m.goal.userId !== userId) throw new ForbiddenException();
    return m;
  }

  async list(userId: string, goalId: string) {
    await this.assertGoalOwner(userId, goalId);
    return this.prisma.milestone.findMany({ where: { goalId }, orderBy: { order: 'asc' } });
  }

  async create(userId: string, goalId: string, dto: CreateMilestoneDto) {
    await this.assertGoalOwner(userId, goalId);
    const count = await this.prisma.milestone.count({ where: { goalId } });
    return this.prisma.milestone.create({
      data: { goalId, title: dto.title, order: dto.order ?? count },
    });
  }

  async update(userId: string, id: string, dto: UpdateMilestoneDto) {
    const existing = await this.assertOwner(userId, id);
    const data: any = {
      title: dto.title ?? undefined,
      order: dto.order ?? undefined,
    };
    if (dto.completed !== undefined) {
      data.completed = dto.completed;
      data.completedAt = dto.completed ? new Date() : null;
    }
    return this.prisma.milestone.update({ where: { id: existing.id }, data });
  }

  async remove(userId: string, id: string) {
    await this.assertOwner(userId, id);
    await this.prisma.milestone.delete({ where: { id } });
    return { success: true };
  }
}
