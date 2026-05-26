import { Controller, Get } from "@nestjs/common";

import { ListarVagasUseCase } from "@application/vaga/use-cases/listar-vagas.use-case.js";
import { VagaResponseDTO } from "@application/vaga/dtos/vaga-response.dto.js";

@Controller("v1/vagas")
export class ListarVagasController {
  constructor(private readonly useCase: ListarVagasUseCase) {}

  @Get()
  async handle(): Promise<VagaResponseDTO[]> {
    const vagas = await this.useCase.execute();

    return vagas.map(
      (vaga) =>
        new VagaResponseDTO(
          vaga.id.toString(),
          vaga.codigo,
          vaga.tipo,
          vaga.disponivel,
        ),
    );
  }
}
