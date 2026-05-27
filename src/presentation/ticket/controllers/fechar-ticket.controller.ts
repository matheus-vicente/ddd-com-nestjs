import { Controller, Param, Put } from "@nestjs/common";

import { TicketResponseDTO } from "@application/ticket/dtos/ticket-response.dto.js";
import { FecharTicketUseCase } from "@application/ticket/use-cases/fechar-ticket.use-case.js";

@Controller("v1/tickets")
export class FecharTicketController {
  constructor(private readonly useCase: FecharTicketUseCase) {}

  @Put(":id/fechar")
  async handle(@Param("id") id: string): Promise<TicketResponseDTO> {
    const ticket = await this.useCase.execute(id);

    return new TicketResponseDTO(ticket);
  }
}
