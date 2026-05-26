import { EntityIdUnico } from "@domain/shared/value-objects/entity-id-unico.vo.js";
import { Ticket } from "@domain/ticket/entities/ticket.entity.js";
import { ITicketsRepository } from "@domain/ticket/repositories/tickets.repository.js";

export class InMemoryTicketsRepository implements ITicketsRepository {
  private tickets: Ticket[] = [];

  public async buscarPorId(id: EntityIdUnico): Promise<Ticket | null> {
    const ticket = this.tickets.find((item) => item.id.equals(id));

    return new Promise((resolve) => resolve(ticket ? ticket : null));
  }

  public async buscarPorCodigo(codigo: string): Promise<Ticket | null> {
    const ticket = this.tickets.find(
      (item) => item.codigo.toString() === codigo,
    );

    return new Promise((resolve) => resolve(ticket ? ticket : null));
  }

  public async listar(): Promise<Ticket[]> {
    return new Promise((resolve) => resolve(this.tickets));
  }

  public async salvar(ticket: Ticket): Promise<Ticket> {
    const itemIndex = this.tickets.findIndex((item) => item.id === ticket.id);

    if (itemIndex >= 0) {
      this.tickets[itemIndex] = ticket;
    } else {
      this.tickets.push(ticket);
    }

    return new Promise((resolve) => resolve(ticket));
  }
}
