import { Inject, Injectable } from "@nestjs/common";

import { IVagasRepository } from "@domain/vaga/repositories/vagas.repository.js";
import { EntityIdUnicoVO } from "@domain/shared/value-objects/entity-id-unico.vo.js";
import { NaoEncontradoException } from "@domain/exceptions/nao-encontrado.exception.js";
import { DomainException } from "@domain/exceptions/domain.exception.js";

@Injectable()
export class DeletarVagaUseCase {
  constructor(
    @Inject(IVagasRepository)
    private readonly vagasRepository: IVagasRepository,
  ) {}

  public async execute(id: string): Promise<void> {
    const idValido = new EntityIdUnicoVO(id);

    const vaga = await this.vagasRepository.buscarPorId(idValido);

    if (!vaga) {
      throw new NaoEncontradoException("Vaga não encontrado");
    }

    if (!vaga.disponivel) {
      throw new DomainException("Não é possível deletar uma vaga ocupada");
    }

    await this.vagasRepository.deletar(idValido);
  }
}
