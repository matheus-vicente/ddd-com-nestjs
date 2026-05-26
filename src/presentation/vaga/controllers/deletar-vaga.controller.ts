import { Controller, Delete, Param } from "@nestjs/common";

import { DeletarVagaUseCase } from "@application/vaga/use-cases/deletar-vaga.use-case.js";

@Controller("v1/vagas")
export class DeletarVagaController {
  constructor(private readonly useCase: DeletarVagaUseCase) {}

  @Delete(":id")
  async handle(@Param("id") id: string): Promise<void> {
    await this.useCase.execute(id);
  }
}
