import { Body, Controller, Param, Post } from "@nestjs/common";

import { GerarTicketUseCase } from "@application/ticket/use-cases/gerar-ticket.use-case.js";
import { TicketResponseDTO } from "@application/ticket/dtos/ticket-response.dto.js";
import {
  InfosTicketDTO,
  type InfosTicketDTOType,
} from "@application/ticket/dtos/infos-ticket.dto.js";

@Controller("v1/vagas")
export class GerarTicketController {
  constructor(private readonly useCase: GerarTicketUseCase) {}

  @Post(":vagaId/gerar-ticket")
  async handle(
    @Param("vagaId") vagaId: string,
    @Body() body: InfosTicketDTOType,
  ): Promise<TicketResponseDTO> {
    const ticketDTO = new InfosTicketDTO(body);

    const ticket = await this.useCase.execute(vagaId, ticketDTO);

    return new TicketResponseDTO(ticket);
  }
}
