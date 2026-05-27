import { Controller, Param, Put } from "@nestjs/common";

import { TicketResponseDTO } from "@application/ticket/dtos/ticket-response.dto.js";
import { CancelarTicketUseCase } from "@application/ticket/use-cases/cancelar-ticket.use-case.js";

@Controller("v1/tickets")
export class CancelarTicketController {
  constructor(private readonly useCase: CancelarTicketUseCase) {}

  @Put(":id/cancelar")
  async handle(@Param("id") id: string): Promise<TicketResponseDTO> {
    const ticket = await this.useCase.execute(id);

    return new TicketResponseDTO(ticket);
  }
}
