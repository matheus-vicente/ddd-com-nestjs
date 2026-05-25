import { Body, Controller, Post } from "@nestjs/common";

import { CriarVagaUseCase } from "@application/vaga/use-cases/criar-vaga.use-case.js";
import {
  InfosVagaDTO,
  type InfosVagaDTOType,
} from "@application/vaga/dtos/infos-vaga.dto.js";
import { VagaResponseDTO } from "@application/vaga/dtos/vaga-response.dto.js";

@Controller("/v1/vagas")
export class CriarVagaController {
  constructor(private readonly useCase: CriarVagaUseCase) {}

  @Post()
  async handle(@Body() body: InfosVagaDTOType): Promise<VagaResponseDTO> {
    const vagaDTO = InfosVagaDTO.validar(body);

    const vaga = await this.useCase.execute(vagaDTO);

    return new VagaResponseDTO(
      vaga.id.toString(),
      vaga.codigo,
      vaga.tipo.toString(),
      vaga.disponivel,
    );
  }
}
