import { beforeEach, describe, expect, it } from "vitest";

import { CancelarTicketUseCase } from "@application/ticket/use-cases/cancelar-ticket.use-case.js";
import { EntityIdUnico } from "@domain/shared/value-objects/entity-id-unico.vo.js";
import { TipoVaga } from "@domain/vaga/enums/tipo-vaga.enum.js";
import { Ticket } from "@domain/ticket/entities/ticket.entity.js";
import { TipoTarifa } from "@domain/ticket/enums/tipo-tarifa.enum.js";
import { Vaga } from "@domain/vaga/entities/vaga.entity.js";
import { StatusTicket } from "@domain/ticket/enums/status-ticket.enum.js";
import { NaoEncontradoException } from "@domain/exceptions/nao-encontrado.exception.js";
import { InMemoryTicketsRepository } from "@infra/persistence/in-memory/in-memory-tickets.repository.js";
import { InMemoryVagasRepository } from "@infra/persistence/in-memory/in-memory-vagas.repository.js";

const CLOCK_BASE = new Date("2024-06-01T12:00:00.000Z");

function criarVaga(ocupar = true): Vaga {
  const vaga = Vaga.create({ codigo: "A-01" });
  if (ocupar) vaga.ocupar();
  return vaga;
}

function criarTicketPendente(
  vagaId: EntityIdUnico,
  criadoEm = CLOCK_BASE,
): Ticket {
  return Ticket.create({
    vagaId,
    placa: "ABC-1234",
    tipoTarifa: TipoTarifa.DIARIA,
    valor: 50,
    criadoEm,
  });
}

describe("CancelarTicketUseCase", () => {
  let vagasRepository: InMemoryVagasRepository;
  let ticketsRepository: InMemoryTicketsRepository;
  let sut: CancelarTicketUseCase;

  beforeEach(() => {
    vagasRepository = new InMemoryVagasRepository();
    ticketsRepository = new InMemoryTicketsRepository();
    sut = new CancelarTicketUseCase(
      vagasRepository,
      ticketsRepository,
      () => CLOCK_BASE,
    );
  });

  describe("quando os dados são válidos", () => {
    it("deve cancelar o ticket e retorná-lo com status CANCELADO", async () => {
      const vaga = criarVaga();
      const ticket = criarTicketPendente(vaga.id);
      vagasRepository.vagas.push(vaga);
      await ticketsRepository.salvar(ticket);

      const resultado = await sut.execute(ticket.id.toString());

      expect(resultado.status).toBe(StatusTicket.CANCELADO);
    });

    it("deve persistir o ticket cancelado no repositório", async () => {
      const vaga = criarVaga();
      const ticket = criarTicketPendente(vaga.id);
      vagasRepository.vagas.push(vaga);
      await ticketsRepository.salvar(ticket);

      await sut.execute(ticket.id.toString());

      const ticketSalvo = await ticketsRepository.buscarPorId(ticket.id);
      expect(ticketSalvo!.status).toBe(StatusTicket.CANCELADO);
    });

    it("deve liberar a vaga após o cancelamento", async () => {
      const vaga = criarVaga();
      const ticket = criarTicketPendente(vaga.id);
      vagasRepository.vagas.push(vaga);
      await ticketsRepository.salvar(ticket);

      expect(vaga.disponivel).toBe(false);

      await sut.execute(ticket.id.toString());

      const vagaAtualizada = await vagasRepository.buscarPorId(vaga.id);
      expect(vagaAtualizada!.disponivel).toBe(true);
    });

    it("deve definir a dataDeSaida do ticket com base no clock injetado", async () => {
      const vaga = criarVaga();
      const ticket = criarTicketPendente(vaga.id);
      vagasRepository.vagas.push(vaga);
      await ticketsRepository.salvar(ticket);

      const resultado = await sut.execute(ticket.id.toString());

      expect(resultado.dataDeSaida).toEqual(CLOCK_BASE);
    });
  });

  describe("quando o ticket não é encontrado", () => {
    it("deve lançar NaoEncontradoException", async () => {
      const idInexistente = new EntityIdUnico().toString();

      await expect(sut.execute(idInexistente)).rejects.toThrow(
        NaoEncontradoException,
      );
    });

    it("deve incluir mensagem descritiva na exceção", async () => {
      const idInexistente = new EntityIdUnico().toString();

      await expect(sut.execute(idInexistente)).rejects.toThrow(
        "Ticket não encontrado",
      );
    });

    it("não deve alterar nenhuma vaga quando o ticket não existe", async () => {
      const vaga = criarVaga();
      vagasRepository.vagas.push(vaga);
      const idInexistente = new EntityIdUnico().toString();

      await expect(sut.execute(idInexistente)).rejects.toThrow();

      const vagaAtualizada = await vagasRepository.buscarPorId(vaga.id);
      expect(vagaAtualizada!.disponivel).toBe(false);
    });
  });

  describe("quando a vaga associada ao ticket não é encontrada", () => {
    it("deve lançar NaoEncontradoException", async () => {
      const vagaIdOrfao = new EntityIdUnico();
      const ticket = criarTicketPendente(vagaIdOrfao);
      await ticketsRepository.salvar(ticket);

      await expect(sut.execute(ticket.id.toString())).rejects.toThrow(
        NaoEncontradoException,
      );
    });

    it("deve incluir mensagem descritiva na exceção", async () => {
      const vagaIdOrfao = new EntityIdUnico();
      const ticket = criarTicketPendente(vagaIdOrfao);
      await ticketsRepository.salvar(ticket);

      await expect(sut.execute(ticket.id.toString())).rejects.toThrow(
        "Vaga não encontrada",
      );
    });

    it("não deve alterar o status do ticket quando a vaga não existe", async () => {
      const vagaIdOrfao = new EntityIdUnico();
      const ticket = criarTicketPendente(vagaIdOrfao);
      await ticketsRepository.salvar(ticket);

      await expect(sut.execute(ticket.id.toString())).rejects.toThrow();

      const ticketNaoAlterado = await ticketsRepository.buscarPorId(ticket.id);
      expect(ticketNaoAlterado!.status).toBe(StatusTicket.PENDENTE);
    });
  });

  describe("quando o ticket não pode ser cancelado", () => {
    it("deve lançar DomainException ao tentar cancelar um ticket já cancelado", async () => {
      const vaga = criarVaga();
      const ticket = criarTicketPendente(vaga.id);
      vagasRepository.vagas.push(vaga);
      await ticketsRepository.salvar(ticket);

      await sut.execute(ticket.id.toString());

      // Recria a vaga e reocupa para o segundo cancelamento
      vaga.ocupar();
      await vagasRepository.salvar(vaga);

      await expect(sut.execute(ticket.id.toString())).rejects.toThrow(
        "Este Ticket já está cancelado",
      );
    });

    it("deve lançar DomainException ao tentar cancelar um ticket já pago", async () => {
      const vaga = criarVaga();
      const ticket = criarTicketPendente(vaga.id);
      ticket.pagar(50, CLOCK_BASE);
      vagasRepository.vagas.push(vaga);
      await ticketsRepository.salvar(ticket);

      await expect(sut.execute(ticket.id.toString())).rejects.toThrow(
        "Não é possível cancelar um Ticket pago",
      );
    });
  });

  describe("quando a vaga não pode ser liberada", () => {
    it("deve lançar DomainException ao tentar liberar uma vaga em manutenção", async () => {
      const vaga = Vaga.rehydrate({
        id: new EntityIdUnico(),
        codigo: "M-01",
        tipo: TipoVaga.MANUTENCAO,
        disponivel: false,
      });
      const ticket = criarTicketPendente(vaga.id);
      vagasRepository.vagas.push(vaga);
      await ticketsRepository.salvar(ticket);

      await expect(sut.execute(ticket.id.toString())).rejects.toThrow(
        "Vaga em manutenção",
      );
    });

    it("não deve cancelar o ticket quando a vaga em manutenção impede a liberação", async () => {
      const vaga = Vaga.rehydrate({
        id: new EntityIdUnico(),
        codigo: "M-02",
        tipo: TipoVaga.MANUTENCAO,
        disponivel: false,
      });
      const ticket = criarTicketPendente(vaga.id);
      vagasRepository.vagas.push(vaga);
      await ticketsRepository.salvar(ticket);

      await expect(sut.execute(ticket.id.toString())).rejects.toThrow();

      const ticketNaoAlterado = await ticketsRepository.buscarPorId(ticket.id);
      expect(ticketNaoAlterado!.status).toBe(StatusTicket.PENDENTE);
    });
  });

  describe("uso do clock injetado", () => {
    it("deve usar a data do clock como dataDeSaida do ticket cancelado", async () => {
      const clockEspecifico = new Date("2024-09-20T15:45:00.000Z");
      const sutComClock = new CancelarTicketUseCase(
        vagasRepository,
        ticketsRepository,
        () => clockEspecifico,
      );

      const vaga = criarVaga();
      const ticket = criarTicketPendente(
        vaga.id,
        new Date("2024-09-20T10:00:00.000Z"),
      );
      vagasRepository.vagas.push(vaga);
      await ticketsRepository.salvar(ticket);

      const resultado = await sutComClock.execute(ticket.id.toString());

      expect(resultado.dataDeSaida).toEqual(clockEspecifico);
    });

    it("deve lançar DomainException quando a data de cancelamento é anterior à criação do ticket", async () => {
      const clockAnterior = new Date("2024-01-01T00:00:00.000Z");
      const criadoEm = new Date("2024-06-01T10:00:00.000Z");

      const sutComClockAnterior = new CancelarTicketUseCase(
        vagasRepository,
        ticketsRepository,
        () => clockAnterior,
      );

      const vaga = criarVaga();
      const ticket = criarTicketPendente(vaga.id, criadoEm);
      vagasRepository.vagas.push(vaga);
      await ticketsRepository.salvar(ticket);

      await expect(
        sutComClockAnterior.execute(ticket.id.toString()),
      ).rejects.toThrow(
        "A data de cancelamento não pode ser antes da data de criação",
      );
    });
  });
});
