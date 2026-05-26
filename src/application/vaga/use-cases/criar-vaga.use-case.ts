import { Inject, Injectable } from "@nestjs/common";

import { Vaga } from "@domain/vaga/entities/vaga.entity.js";
import { DomainException } from "@domain/exceptions/domain.exception.js";
import { IVagasRepository } from "@domain/vaga/repositories/vagas.repository.js";
import { InfosVagaDTO } from "@application/vaga/dtos/infos-vaga.dto.js";

@Injectable()
export class CriarVagaUseCase {
  constructor(
    @Inject(IVagasRepository)
    private readonly vagasRepository: IVagasRepository,
  ) {}

  async execute(vagaDTO: InfosVagaDTO): Promise<Vaga> {
    const codigoExiste = await this.vagasRepository.buscarPorCodigo(
      vagaDTO.codigo,
    );

    if (codigoExiste) {
      throw new DomainException("Este código já está cadastrado");
    }

    const vaga = Vaga.create({
      codigo: vagaDTO.codigo,
      tipo: vagaDTO.tipo,
    });

    const vagaCriada = await this.vagasRepository.salvar(vaga);

    return vagaCriada;
  }
}
