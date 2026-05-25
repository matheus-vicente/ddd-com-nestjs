import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { VagaModule } from "@infra/http/modules/vaga.module.js";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), VagaModule],
})
export class AppModule {}
