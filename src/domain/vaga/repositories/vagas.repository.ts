import { Vaga } from "@domain/vaga/entities/vaga.entity.js";

export abstract class IVagasRepository {
  abstract listar(): Promise<Vaga[]>;
  abstract buscarPorId(id: string): Promise<Vaga | null>;
  abstract buscarPorCodigo(codigo: string): Promise<Vaga | null>;
  abstract salvar(vaga: Vaga): Promise<Vaga>;
  abstract deletar(id: string): Promise<void>;
}
