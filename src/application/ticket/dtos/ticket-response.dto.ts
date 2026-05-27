import { Ticket } from "@domain/ticket/entities/ticket.entity.js";
import { TipoTarifa } from "@domain/ticket/enums/tipo-tarifa.enum.js";

export class TicketResponseDTO {
  readonly id: string;
  readonly codigo: string;
  readonly vagaId: string;
  readonly status: string;
  readonly placa: string;
  readonly tarifa: TipoTarifa;
  readonly valor: number;
  readonly criadoEm: Date;
  readonly dataDeSaida?: Date;

  constructor(ticket: Ticket) {
    this.id = ticket.id.toString();
    this.codigo = ticket.codigo.toString();
    this.vagaId = ticket.vagaId.toString();
    this.status = ticket.status;
    this.placa = ticket.placa.toString();
    this.tarifa = ticket.tarifa.tipo;
    this.valor = ticket.valor;
    this.criadoEm = ticket.criadoEm;
    this.dataDeSaida = ticket.dataDeSaida ?? undefined;
  }
}
