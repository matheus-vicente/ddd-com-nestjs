import { Vaga } from "@domain/vaga/entities/vaga.entity.js";
import { EntityIdUnicoVO } from "@domain/shared/value-objects/entity-id-unico.vo.js";

export abstract class IVagasRepository {
  abstract listar(): Promise<Vaga[]>;
  abstract buscarPorId(id: EntityIdUnicoVO): Promise<Vaga | null>;
  abstract buscarPorCodigo(codigo: string): Promise<Vaga | null>;
  abstract salvar(vaga: Vaga): Promise<Vaga>;
  abstract deletar(id: EntityIdUnicoVO): Promise<void>;
}
