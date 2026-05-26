import { Ticket } from "@domain/ticket/entities/ticket.entity.js";
import { EntityIdUnico } from "@domain/shared/value-objects/entity-id-unico.vo.js";

export abstract class ITicketsRepository {
  public abstract buscarPorId(id: EntityIdUnico): Promise<Ticket | null>;
  public abstract buscarPorCodigo(codigo: string): Promise<Ticket | null>;
  public abstract salvar(ticket: Ticket): Promise<Ticket>;
  public abstract listar(): Promise<Ticket[]>;
}
