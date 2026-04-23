import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SceneService {
  constructor(private prisma: PrismaService) {}

  async getState(userId: string) {
    const goals = await this.prisma.goal.findMany({
      where: { userId },
      include: { milestones: true },
      orderBy: { vertexIndex: 'asc' },
    });

    let total = 0, done = 0;
    const vertices = goals.map(g => {
      const t = g.milestones.length;
      const d = g.milestones.filter(m => m.completed).length;
      total += t; done += d;
      return {
        goalId: g.id,
        title: g.title,
        priority: g.priority,
        vertexIndex: g.vertexIndex,
        totalMilestones: t,
        completedMilestones: d,
        growth: Math.min(1, d * 0.15),
      };
    });

    return {
      goalCount: goals.length,
      overallCompletion: total === 0 ? 0 : done / total,
      totalMilestones: total,
      completedMilestones: done,
      vertices,
    };
  }
}
