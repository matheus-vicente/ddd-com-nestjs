import { Module } from "@nestjs/common";

import { CancelarTicketUseCase } from "@application/ticket/use-cases/cancelar-ticket.use-case.js";
import { FecharTicketUseCase } from "@application/ticket/use-cases/fechar-ticket.use-case.js";
import { GerarTicketUseCase } from "@application/ticket/use-cases/gerar-ticket.use-case.js";
import { ITicketsRepository } from "@domain/ticket/repositories/tickets.repository.js";
import { IVagasRepository } from "@domain/vaga/repositories/vagas.repository.js";
import { CalcularTarifaService } from "@domain/ticket/services/calcular-tarifa.service.js";
import { CLOCK } from "@infra/http/tokens/clock.token.js";
import { PrismaTicketsRepository } from "@infra/persistence/prisma/repositories/prisma-tickets.repository.js";
import { PrismaVagasRepository } from "@infra/persistence/prisma/repositories/prisma-vagas.repository.js";
import { GerarTicketController } from "@presentation/ticket/controllers/gerar-ticket.controller.js";
import { CancelarTicketController } from "@presentation/ticket/controllers/cancelar-ticket.controller.js";
import { FecharTicketController } from "@presentation/ticket/controllers/fechar-ticket.controller.js";
@Module({
  controllers: [
    GerarTicketController,
    CancelarTicketController,
    FecharTicketController,
  ],
  providers: [
    {
      provide: ITicketsRepository,
      useClass: PrismaTicketsRepository,
    },
    {
      provide: IVagasRepository,
      useClass: PrismaVagasRepository,
    },
    {
      provide: CLOCK,
      useFactory: () => () => new Date(),
    },
    {
      provide: CalcularTarifaService,
      useClass: CalcularTarifaService,
    },
    GerarTicketUseCase,
    CancelarTicketUseCase,
    FecharTicketUseCase,
  ],
})
export class TicketModule {}
