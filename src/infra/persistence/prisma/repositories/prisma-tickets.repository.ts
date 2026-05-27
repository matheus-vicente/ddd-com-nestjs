import { Injectable } from "@nestjs/common";

import { EntityIdUnico } from "@domain/shared/value-objects/entity-id-unico.vo.js";
import { Ticket } from "@domain/ticket/entities/ticket.entity.js";
import { ITicketsRepository } from "@domain/ticket/repositories/tickets.repository.js";
import { PrismaService } from "@infra/persistence/prisma/prisma.service.js";
import { TicketMapper } from "@infra/persistence/prisma/mappers/ticket.mapper.js";
import { Ticket as PrismaTicket } from "@infra/persistence/prisma/client/client.js";

@Injectable()
export class PrismaTicketsRepository implements ITicketsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async buscarPorId(id: EntityIdUnico): Promise<Ticket | null> {
    const prismaticket = await this.prisma.ticket.findUnique({
      where: { id: id.toString() },
    });

    if (!prismaticket) {
      return null;
    }

    return TicketMapper.toDomain(prismaticket);
  }

  public async buscarPorCodigo(codigo: string): Promise<Ticket | null> {
    const prismaticket = await this.prisma.ticket.findUnique({
      where: { codigo },
    });

    if (!prismaticket) {
      return null;
    }

    return TicketMapper.toDomain(prismaticket);
  }

  public async salvar(ticket: Ticket): Promise<Ticket> {
    const update: Omit<PrismaTicket, "id"> = TicketMapper.fromDomain(ticket);

    const prismaticket = await this.prisma.ticket.upsert({
      where: { id: ticket.id.toString() },

      create: TicketMapper.fromDomain(ticket),

      update,
    });

    return TicketMapper.toDomain(prismaticket);
  }

  public async listar(): Promise<Ticket[]> {
    const prismaTickets = await this.prisma.ticket.findMany();

    return prismaTickets.map((item) => TicketMapper.toDomain(item));
  }
}
