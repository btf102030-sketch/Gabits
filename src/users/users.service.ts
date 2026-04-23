import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateOnboardingDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async me(userId: string) {
    const u = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!u) throw new NotFoundException('User not found');
    return { id: u.id, email: u.email, name: u.name, onboardingCompleted: u.onboardingCompleted };
  }

  async updateOnboarding(userId: string, dto: UpdateOnboardingDto) {
    const u = await this.prisma.user.update({
      where: { id: userId },
      data: { onboardingCompleted: dto.onboardingCompleted ?? undefined },
    });
    return { id: u.id, email: u.email, name: u.name, onboardingCompleted: u.onboardingCompleted };
  }
}
