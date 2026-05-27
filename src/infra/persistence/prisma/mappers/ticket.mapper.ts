import { Ticket } from "@domain/ticket/entities/ticket.entity.js";
import { EntityIdUnico } from "@domain/shared/value-objects/entity-id-unico.vo.js";
import { Ticket as PrismaTicket } from "@infra/persistence/prisma/client/client.js";
import { StatusTicket } from "@domain/ticket/enums/status-ticket.enum.js";
import { TipoTarifa } from "@domain/ticket/enums/tipo-tarifa.enum.js";

export class TicketMapper {
  static fromDomain({
    id,
    codigo,
    placa,
    vagaId,
    status,
    tarifa,
    valor,
    criadoEm,
    dataDeSaida,
  }: Ticket): PrismaTicket {
    return {
      id: id.toString(),
      codigo: codigo.toString(),
      placa: placa.toString(),
      vagaId: vagaId.toString(),
      status,
      tipoTarifa: tarifa.tipo,
      valorTarifa: tarifa.valor,
      valorAdicionalTarifa: tarifa.valorAdicional,
      valor,
      criadoEm,
      dataDeSaida: dataDeSaida ? dataDeSaida : null,
    };
  }

  public static toDomain({
    id,
    codigo,
    placa,
    vagaId,
    status,
    tipoTarifa,
    valorTarifa,
    valorAdicionalTarifa,
    valor,
    criadoEm,
    dataDeSaida,
  }: PrismaTicket): Ticket {
    return Ticket.rehydrate({
      id,
      codigo,
      placa,
      vagaId: new EntityIdUnico(vagaId),
      status: status as StatusTicket,
      tipoTarifa: tipoTarifa as TipoTarifa,
      valorTarifa,
      valorAdicionalTarifa,
      valor,
      criadoEm,
      dataDeSaida: dataDeSaida ? dataDeSaida : undefined,
    });
  }
}
