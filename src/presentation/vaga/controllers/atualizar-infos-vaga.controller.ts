import { Controller, Put, Param, Body } from "@nestjs/common";

import { VagaResponseDTO } from "@application/vaga/dtos/vaga-response.dto.js";
import { AtualizarInfosVagaUseCase } from "@application/vaga/use-cases/atualizar-infos-vaga.use-case.js";
import {
  InfosVagaDTO,
  type InfosVagaDTOType,
} from "@application/vaga/dtos/infos-vaga.dto.js";

@Controller("v1/vagas")
export class AtualizarInfosVagaController {
  constructor(private readonly useCase: AtualizarInfosVagaUseCase) {}

  @Put(":id")
  async handle(
    @Param("id") id: string,
    @Body() body: InfosVagaDTOType,
  ): Promise<VagaResponseDTO> {
    const vagaDTO = InfosVagaDTO.validar(body);

    const vaga = await this.useCase.execute(id, vagaDTO);

    return new VagaResponseDTO(
      vaga.id.toString(),
      vaga.codigo,
      vaga.tipo.toString(),
      vaga.disponivel,
    );
  }
}
