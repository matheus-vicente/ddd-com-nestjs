import { Global, Module } from "@nestjs/common";

import { PrismaService } from "@infra/persistence/prisma/prisma.service.js";

@Global()
@Module({
  exports: [PrismaService],
  providers: [PrismaService],
})
export class PrismaModule {}
