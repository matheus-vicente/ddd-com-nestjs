import { Inject, Injectable } from "@nestjs/common";

import { Vaga } from "@domain/vaga/entities/vaga.entity.js";
import { IVagasRepository } from "@domain/vaga/repositories/vagas.repository.js";

@Injectable()
export class ListarVagasUseCase {
  constructor(
    @Inject(IVagasRepository)
    private readonly vagasRepository: IVagasRepository,
  ) {}

  public async execute(): Promise<Vaga[]> {
    const vagas: Vaga[] = await this.vagasRepository.listar();

    return vagas;
  }
}
