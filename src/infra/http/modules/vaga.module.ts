import { Module } from "@nestjs/common";

// import { InMemoryVagasRepository } from "@infra/persistence/in-memory/in-memory-vagas.repository.js";
import { PrismaVagasRepository } from "@infra/persistence/prisma/repositories/prisma-vagas.repository.js";
import { IVagasRepository } from "@domain/vaga/repositories/vagas.repository.js";
import { CriarVagaUseCase } from "@application/vaga/use-cases/criar-vaga.use-case.js";
import { ListarVagasUseCase } from "@application/vaga/use-cases/listar-vagas.use-case.js";
import { DeletarVagaUseCase } from "@application/vaga/use-cases/deletar-vaga.use-case.js";
import { AtualizarInfosVagaUseCase } from "@application/vaga/use-cases/atualizar-infos-vaga.use-case.js";
import { CriarVagaController } from "@presentation/vaga/controllers/criar-vaga.controller.js";
import { ListarVagasController } from "@presentation/vaga/controllers/listar-vagas.controller.js";
import { DeletarVagaController } from "@presentation/vaga/controllers/deletar-vaga.controller.js";
import { AtualizarInfosVagaController } from "@presentation/vaga/controllers/atualizar-infos-vaga.controller.js";

@Module({
  controllers: [
    CriarVagaController,
    AtualizarInfosVagaController,
    ListarVagasController,
    DeletarVagaController,
  ],
  providers: [
    { provide: IVagasRepository, useClass: PrismaVagasRepository },
    CriarVagaUseCase,
    AtualizarInfosVagaUseCase,
    ListarVagasUseCase,
    DeletarVagaUseCase,
  ],
})
export class VagaModule {}
