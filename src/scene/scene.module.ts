import { Module } from '@nestjs/common';
import { SceneService } from './scene.service';
import { SceneController } from './scene.controller';

@Module({
  providers: [SceneService],
  controllers: [SceneController],
})
export class SceneModule {}
