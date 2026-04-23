import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoalDto, UpdateGoalDto } from './dto';

const MAX_GOALS = 12;

function serialize(g: any) {
  const totalM = g.milestones?.length ?? 0;
  const doneM = (g.milestones ?? []).filter((m: any) => m.completed).length;
  return {
    id: g.id,
    title: g.title,
    description: g.description,
    priority: g.priority,
    vertexIndex: g.vertexIndex,
    totalMilestones: totalM,
    completedMilestones: doneM,
    progressPercent: totalM === 0 ? 0 : Math.round((doneM / totalM) * 10000) / 100,
    milestones: (g.milestones ?? []).map((m: any) => ({
      id: m.id, title: m.title, order: m.order, completed: m.completed, completedAt: m.completedAt,
    })),
    createdAt: g.createdAt,
    updatedAt: g.updatedAt,
  };
}

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  private include() {
    return { milestones: { orderBy: { order: 'asc' as const } } };
  }

  private async nextVertexIndex(userId: string): Promise<number> {
    const taken = new Set(
      (await this.prisma.goal.findMany({ where: { userId }, select: { vertexIndex: true } })).map(g => g.vertexIndex),
    );
    for (let i = 0; i < MAX_GOALS; i++) if (!taken.has(i)) return i;
    throw new BadRequestException(`You can have at most ${MAX_GOALS} goals.`);
  }

  async list(userId: string) {
    const goals = await this.prisma.goal.findMany({
      where: { userId },
      include: this.include(),
      orderBy: { vertexIndex: 'asc' },
    });
    return { goals: goals.map(serialize) };
  }

  async get(userId: string, id: string) {
    const g = await this.prisma.goal.findUnique({ where: { id }, include: this.include() });
    if (!g) throw new NotFoundException('Goal not found');
    if (g.userId !== userId) throw new ForbiddenException();
    return serialize(g);
  }

  async create(userId: string, dto: CreateGoalDto) {
    const count = await this.prisma.goal.count({ where: { userId } });
    if (count >= MAX_GOALS) throw new BadRequestException(`You can have at most ${MAX_GOALS} goals.`);
    const vertexIndex = await this.nextVertexIndex(userId);
    const g = await this.prisma.goal.create({
      data: { userId, title: dto.title, description: dto.description, priority: dto.priority, vertexIndex },
      include: this.include(),
    });
    return serialize(g);
  }

  async update(userId: string, id: string, dto: UpdateGoalDto) {
    const existing = await this.prisma.goal.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException();
    if (existing.userId !== userId) throw new ForbiddenException();
    if (dto.vertexIndex !== undefined && dto.vertexIndex !== existing.vertexIndex) {
      const clash = await this.prisma.goal.findUnique({ where: { userId_vertexIndex: { userId, vertexIndex: dto.vertexIndex } } });
      if (clash) throw new ConflictException('That vertex is already assigned.');
    }
    const g = await this.prisma.goal.update({
      where: { id },
      data: {
        title: dto.title ?? undefined,
        description: dto.description ?? undefined,
        priority: dto.priority ?? undefined,
        vertexIndex: dto.vertexIndex ?? undefined,
      },
      include: this.include(),
    });
    return serialize(g);
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.goal.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException();
    if (existing.userId !== userId) throw new ForbiddenException();
    await this.prisma.goal.delete({ where: { id } });
    // Reflow vertexIndex values so they stay contiguous 0..count-1
    const remaining = await this.prisma.goal.findMany({ where: { userId }, orderBy: { vertexIndex: 'asc' } });
    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i].vertexIndex !== i) {
        await this.prisma.goal.update({ where: { id: remaining[i].id }, data: { vertexIndex: i } });
      }
    }
    return { success: true };
  }
}
