import { Injectable } from "@nestjs/common";

import { EntityIdUnico } from "@domain/shared/value-objects/entity-id-unico.vo.js";
import { Ticket } from "@domain/ticket/entities/ticket.entity.js";
import { ITicketsRepository } from "@domain/ticket/repositories/tickets.repository.js";
import { IVagasRepository } from "@domain/vaga/repositories/vagas.repository.js";
import { NaoEncontradoException } from "@domain/exceptions/nao-encontrado.exception.js";
import { CalcularTarifaService } from "@domain/ticket/services/calcular-tarifa.service.js";

@Injectable()
export class FecharTicketUseCase {
  constructor(
    private readonly vagasRepository: IVagasRepository,
    private readonly ticketsRepository: ITicketsRepository,
    private readonly calcularTarifa: CalcularTarifaService,
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

    const dataDeSaida = this.clock;

    const valor = this.calcularTarifa.calcular(ticket, dataDeSaida);

    ticket.pagar(valor, dataDeSaida);
    vaga.liberar();

    await this.vagasRepository.salvar(vaga);
    const ticketPago = await this.ticketsRepository.salvar(ticket);

    return ticketPago;
  }
}
