import { Injectable } from "@nestjs/common";

import { NaoEncontradoException } from "@domain/exceptions/nao-encontrado.exception.js";
import { EntityIdUnico } from "@domain/shared/value-objects/entity-id-unico.vo.js";
import { Ticket } from "@domain/ticket/entities/ticket.entity.js";
import { ITicketsRepository } from "@domain/ticket/repositories/tickets.repository.js";
import { IVagasRepository } from "@domain/vaga/repositories/vagas.repository.js";

@Injectable()
export class CancelarTicketUseCase {
  constructor(
    private readonly vagasRepository: IVagasRepository,
    private readonly ticketsRepository: ITicketsRepository,
    private readonly clock: Date,
  ) {}

  public async execute(id: string): Promise<Ticket> {
    const ticket = await this.ticketsRepository.buscarPorId(
      new EntityIdUnico(id),
    );

    if (!ticket) {
      throw new NaoEncontradoException("Ticket não encontrado");
    }

    const vaga = await this.vagasRepository.buscarPorId(ticket.vagaId);

    if (!vaga) {
      throw new NaoEncontradoException("Vaga não encontrada");
    }

    vaga.liberar();
    ticket.cancelar(new Date(this.clock));

    await this.vagasRepository.salvar(vaga);
    const ticketCancelado = await this.ticketsRepository.salvar(ticket);

    return ticketCancelado;
  }
}
