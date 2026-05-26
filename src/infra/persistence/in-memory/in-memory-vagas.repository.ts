import { Vaga } from "@domain/vaga/entities/vaga.entity.js";
import { IVagasRepository } from "@domain/vaga/repositories/vagas.repository.js";
import { EntityIdUnico } from "@domain/shared/value-objects/entity-id-unico.vo.js";

export class InMemoryVagasRepository implements IVagasRepository {
  public vagas: Vaga[] = [];

  async listar(): Promise<Vaga[]> {
    return new Promise((resolve) => resolve(this.vagas));
  }

  async buscarPorId(id: EntityIdUnico): Promise<Vaga | null> {
    const vaga = this.vagas.find((item) => item.id.equals(id));

    return new Promise((resolve) => resolve(vaga ? vaga : null));
  }

  async buscarPorCodigo(codigo: string): Promise<Vaga | null> {
    const vaga = this.vagas.find((item) => item.codigo === codigo);

    return new Promise((resolve) => resolve(vaga ? vaga : null));
  }

  async salvar(vaga: Vaga): Promise<Vaga> {
    const itemIndex = this.vagas.findIndex((item) => item.id === vaga.id);

    if (itemIndex >= 0) {
      this.vagas[itemIndex] = vaga;
    } else {
      this.vagas.push(vaga);
    }

    return new Promise((resolve) => resolve(vaga));
  }

  async deletar(id: EntityIdUnico): Promise<void> {
    const itemIndex = this.vagas.findIndex((item) => item.id.equals(id));

    if (itemIndex >= 0) {
      this.vagas.splice(itemIndex, 1);
    }

    return Promise.resolve();
  }
}
