import { Inject, Injectable } from "@nestjs/common";

import { IVagasRepository } from "@domain/vaga/repositories/vagas.repository.js";
import { InfosVagaDTO } from "@application/vaga/dtos/infos-vaga.dto.js";
import { Vaga } from "@domain/vaga/entities/vaga.entity.js";
import { NaoEncontradoException } from "@domain/vaga/exceptions/nao-encontrado.exception.js";
import { DomainException } from "@domain/vaga/exceptions/domain.exception.js";
import { EntityIdUnicoVO } from "@domain/vaga/shared/value-objects/entity-id-unico.vo.js";

@Injectable()
export class AtualizarInfosVagaUseCase {
  constructor(
    @Inject(IVagasRepository)
    private readonly vagasRepository: IVagasRepository,
  ) {}

  public async execute(id: string, vagaDTO: InfosVagaDTO): Promise<Vaga> {
    const vagaExiste = await this.vagasRepository.buscarPorId(
      new EntityIdUnicoVO(id),
    );

    if (!vagaExiste) {
      throw new NaoEncontradoException("Vaga não encontrada");
    }

    if (vagaExiste.codigo.toUpperCase() !== vagaDTO.codigo.toUpperCase()) {
      const codigoExiste = await this.vagasRepository.buscarPorCodigo(
        vagaDTO.codigo,
      );

      if (codigoExiste) {
        throw new DomainException("Este código já está cadastrado");
      }
    }

    vagaExiste.atualizarInfos({
      codigo: vagaDTO.codigo,
      tipo: vagaDTO.tipo,
    });

    const vaga = await this.vagasRepository.salvar(vagaExiste);

    return vaga;
  }
}
