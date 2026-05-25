import { Module } from "@nestjs/common";

import { CriarVagaUseCase } from "@application/vaga/use-cases/criar-vaga.use-case.js";
import { IVagasRepository } from "@domain/vaga/repositories/vagas.repository.js";
import { InMemoryVagasRepository } from "@infra/persistence/in-memory/in-memory-vagas.repository.js";
import { CriarVagaController } from "@presentation/vaga/controllers/criar-vaga.controller.js";

@Module({
  controllers: [CriarVagaController],
  providers: [
    { provide: IVagasRepository, useClass: InMemoryVagasRepository },
    CriarVagaUseCase,
  ],
})
export class VagaModule {}
