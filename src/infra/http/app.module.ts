import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { VagaModule } from "@infra/http/modules/vaga.module.js";
import { PrismaModule } from "@infra/persistence/prisma/prisma.module.js";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, VagaModule],
})
export class AppModule {}
