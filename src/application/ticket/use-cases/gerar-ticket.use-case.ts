import { Inject, Injectable } from "@nestjs/common";

import { InfosTicketDTO } from "@application/ticket/dtos/infos-ticket.dto.js";
import { NaoEncontradoException } from "@domain/exceptions/nao-encontrado.exception.js";
import { EntityIdUnico } from "@domain/shared/value-objects/entity-id-unico.vo.js";
import { Ticket } from "@domain/ticket/entities/ticket.entity.js";
import { ITicketsRepository } from "@domain/ticket/repositories/tickets.repository.js";
import { IVagasRepository } from "@domain/vaga/repositories/vagas.repository.js";
import { CLOCK } from "@infra/http/tokens/clock.token.js";

@Injectable()
export class GerarTicketUseCase {
  constructor(
    private readonly vagasRepository: IVagasRepository,
    private readonly ticketsRepository: ITicketsRepository,
    @Inject(CLOCK)
    private readonly clock: () => Date,
  ) {}

  public async execute(
    vagaId: string,
    ticketDTO: InfosTicketDTO,
  ): Promise<Ticket> {
    const idValido = new EntityIdUnico(vagaId);
    const vaga = await this.vagasRepository.buscarPorId(idValido);

    if (!vaga) {
      throw new NaoEncontradoException(`Vaga não encontrada`);
    }

    vaga.ocupar();

    const ticket = Ticket.create({
      vagaId: new EntityIdUnico(vagaId),
      placa: ticketDTO.placa,
      tipoTarifa: ticketDTO.tipo,
      valor: ticketDTO.valor,
      valorAdicional: ticketDTO.valorAdicional,
      criadoEm: this.clock(),
    });

    await this.vagasRepository.salvar(vaga);

    const ticketSalvo = await this.ticketsRepository.salvar(ticket);

    return ticketSalvo;
  }
}
