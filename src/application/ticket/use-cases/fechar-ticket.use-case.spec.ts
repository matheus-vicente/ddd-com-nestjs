import { beforeEach, describe, expect, it } from "vitest";

import { DomainException } from "@domain/exceptions/domain.exception.js";
import { EntityIdUnico } from "@domain/shared/value-objects/entity-id-unico.vo.js";
import { Ticket } from "@domain/ticket/entities/ticket.entity.js";
import { TipoTarifa } from "@domain/ticket/enums/tipo-tarifa.enum.js";
import { CalcularTarifaService } from "@domain/ticket/services/calcular-tarifa.service.js";
import { Vaga } from "@domain/vaga/entities/vaga.entity.js";
import { InMemoryTicketsRepository } from "@infra/persistence/in-memory/in-memory-tickets.repository.js";
import { InMemoryVagasRepository } from "@infra/persistence/in-memory/in-memory-vagas.repository.js";
import { FecharTicketUseCase } from "./fechar-ticket.use-case.js";
import { StatusTicket } from "@domain/ticket/enums/status-ticket.enum.js";
import { NaoEncontradoException } from "@domain/exceptions/nao-encontrado.exception.js";
import { TipoVaga } from "@domain/vaga/enums/tipo-vaga.enum.js";

const CRIADO_EM = new Date("2024-06-01T10:00:00.000Z");
const CLOCK_BASE = new Date("2024-06-01T12:00:00.000Z");

function criarVagaOcupada(): Vaga {
  const vaga = Vaga.create({ codigo: "A-01" });
  vaga.ocupar();
  return vaga;
}

function criarTicket(
  vagaId: EntityIdUnico,
  opts: {
    tipoTarifa?: TipoTarifa;
    valor?: number;
    valorAdicional?: number;
    criadoEm?: Date;
  } = {},
): Ticket {
  return Ticket.create({
    vagaId,
    placa: "ABC-1234",
    tipoTarifa: opts.tipoTarifa ?? TipoTarifa.DIARIA,
    valor: opts.valor ?? 50,
    valorAdicional: opts.valorAdicional,
    criadoEm: opts.criadoEm ?? CRIADO_EM,
  });
}

function buildSut(
  vagasRepo: InMemoryVagasRepository,
  ticketsRepo: InMemoryTicketsRepository,
  clock: Date,
  tarifaService?: CalcularTarifaService,
) {
  return new FecharTicketUseCase(
    vagasRepo,
    ticketsRepo,
    tarifaService ?? new CalcularTarifaService(),
    () => clock,
  );
}

describe("FecharTicketUseCase", () => {
  let vagasRepository: InMemoryVagasRepository;
  let ticketsRepository: InMemoryTicketsRepository;
  let calcularTarifaService: CalcularTarifaService;
  let sut: FecharTicketUseCase;

  beforeEach(() => {
    vagasRepository = new InMemoryVagasRepository();
    ticketsRepository = new InMemoryTicketsRepository();
    calcularTarifaService = new CalcularTarifaService();

    sut = buildSut(
      vagasRepository,
      ticketsRepository,
      CLOCK_BASE,
      calcularTarifaService,
    );
  });

  describe("quando os dados são válidos", () => {
    it("deve retornar o ticket com status PAGO", async () => {
      const vaga = criarVagaOcupada();
      const ticket = criarTicket(vaga.id);
      vagasRepository.vagas.push(vaga);
      await ticketsRepository.salvar(ticket);

      const resultado = await sut.execute(ticket.id.toString());

      expect(resultado.status).toBe(StatusTicket.PAGO);
    });

    it("deve persistir o ticket pago no repositório", async () => {
      const vaga = criarVagaOcupada();
      const ticket = criarTicket(vaga.id);
      vagasRepository.vagas.push(vaga);
      await ticketsRepository.salvar(ticket);

      await sut.execute(ticket.id.toString());

      const salvo = await ticketsRepository.buscarPorId(ticket.id);
      expect(salvo!.status).toBe(StatusTicket.PAGO);
    });

    it("deve liberar a vaga após o fechamento", async () => {
      const vaga = criarVagaOcupada();
      const ticket = criarTicket(vaga.id);
      vagasRepository.vagas.push(vaga);
      await ticketsRepository.salvar(ticket);

      await sut.execute(ticket.id.toString());

      const vagaAtualizada = await vagasRepository.buscarPorId(vaga.id);
      expect(vagaAtualizada!.disponivel).toBe(true);
    });
  });

  describe("CalcularTarifaService — tarifas de valor fixo", () => {
    it("deve cobrar o valor fixo para tarifa DIARIA independente da permanência", async () => {
      const vaga = criarVagaOcupada();
      const ticket = criarTicket(vaga.id, {
        tipoTarifa: TipoTarifa.DIARIA,
        valor: 80,
      });
      vagasRepository.vagas.push(vaga);
      await ticketsRepository.salvar(ticket);

      const resultado = await sut.execute(ticket.id.toString());

      expect(resultado.valor).toBe(80);
    });

    it("deve cobrar o valor fixo para tarifa MENSAL independente da permanência", async () => {
      const vaga = criarVagaOcupada();
      const ticket = criarTicket(vaga.id, {
        tipoTarifa: TipoTarifa.MENSAL,
        valor: 400,
      });
      vagasRepository.vagas.push(vaga);
      await ticketsRepository.salvar(ticket);

      const resultado = await sut.execute(ticket.id.toString());

      expect(resultado.valor).toBe(400);
    });
  });

  describe("CalcularTarifaService — tarifa por hora adicional", () => {
    const VALOR_HORA = 15;
    const VALOR_ADICIONAL = 8;

    function criarTicketHoraAdicional(vagaId: EntityIdUnico, criadoEm: Date) {
      return criarTicket(vagaId, {
        tipoTarifa: TipoTarifa.PRIMEIRA_HORA_MAIS_HORA_ADICIONAL,
        valor: VALOR_HORA,
        valorAdicional: VALOR_ADICIONAL,
        criadoEm,
      });
    }

    it("deve cobrar zero para permanência inferior a 15 minutos", async () => {
      const criadoEm = new Date("2024-06-01T10:00:00.000Z");
      const clock = new Date("2024-06-01T10:10:00.000Z");
      const sutLocal = buildSut(vagasRepository, ticketsRepository, clock);

      const vaga = criarVagaOcupada();
      const ticket = criarTicketHoraAdicional(vaga.id, criadoEm);
      vagasRepository.vagas.push(vaga);
      await ticketsRepository.salvar(ticket);

      const resultado = await sutLocal.execute(ticket.id.toString());

      expect(resultado.valor).toBe(0);
    });

    it("deve cobrar apenas a primeira hora para permanência entre 15 min e 1h", async () => {
      const criadoEm = new Date("2024-06-01T10:00:00.000Z");
      const clock = new Date("2024-06-01T10:30:00.000Z");
      const sutLocal = buildSut(vagasRepository, ticketsRepository, clock);

      const vaga = criarVagaOcupada();
      const ticket = criarTicketHoraAdicional(vaga.id, criadoEm);
      vagasRepository.vagas.push(vaga);
      await ticketsRepository.salvar(ticket);

      const resultado = await sutLocal.execute(ticket.id.toString());

      expect(resultado.valor).toBe(VALOR_HORA);
    });

    it("deve cobrar apenas a primeira hora para permanência de exatamente 1h", async () => {
      const criadoEm = new Date("2024-06-01T10:00:00.000Z");
      const clock = new Date("2024-06-01T11:00:00.000Z");
      const sutLocal = buildSut(vagasRepository, ticketsRepository, clock);

      const vaga = criarVagaOcupada();
      const ticket = criarTicketHoraAdicional(vaga.id, criadoEm);
      vagasRepository.vagas.push(vaga);
      await ticketsRepository.salvar(ticket);

      const resultado = await sutLocal.execute(ticket.id.toString());

      expect(resultado.valor).toBe(VALOR_HORA);
    });

    it("deve acumular horas adicionais para permanência de 3h", async () => {
      const criadoEm = new Date("2024-06-01T10:00:00.000Z");
      const clock = new Date("2024-06-01T13:00:00.000Z");
      const sutLocal = buildSut(vagasRepository, ticketsRepository, clock);

      const vaga = criarVagaOcupada();
      const ticket = criarTicketHoraAdicional(vaga.id, criadoEm);
      vagasRepository.vagas.push(vaga);
      await ticketsRepository.salvar(ticket);

      const resultado = await sutLocal.execute(ticket.id.toString());

      expect(resultado.valor).toBe(31);
    });
  });

  describe("quando o ticket não é encontrado", () => {
    it("deve lançar NaoEncontradoException", async () => {
      await expect(sut.execute(new EntityIdUnico().toString())).rejects.toThrow(
        NaoEncontradoException,
      );
    });

    it("não deve alterar nenhuma vaga quando o ticket não existe", async () => {
      const vaga = criarVagaOcupada();
      vagasRepository.vagas.push(vaga);

      await expect(
        sut.execute(new EntityIdUnico().toString()),
      ).rejects.toThrow();

      const vagaAtualizada = await vagasRepository.buscarPorId(vaga.id);
      expect(vagaAtualizada!.disponivel).toBe(false);
    });
  });

  describe("quando a vaga associada ao ticket não é encontrada", () => {
    it("deve lançar NaoEncontradoException", async () => {
      const ticket = criarTicket(new EntityIdUnico());
      await ticketsRepository.salvar(ticket);

      await expect(sut.execute(ticket.id.toString())).rejects.toThrow(
        NaoEncontradoException,
      );
    });

    it("não deve alterar o status do ticket quando a vaga não existe", async () => {
      const ticket = criarTicket(new EntityIdUnico());
      await ticketsRepository.salvar(ticket);

      await expect(sut.execute(ticket.id.toString())).rejects.toThrow();

      const inalterado = await ticketsRepository.buscarPorId(ticket.id);
      expect(inalterado!.status).toBe(StatusTicket.PENDENTE);
    });
  });

  describe("quando o ticket não pode ser pago", () => {
    it("deve lançar DomainException ao tentar pagar um ticket já pago", async () => {
      const vaga = criarVagaOcupada();
      const ticket = criarTicket(vaga.id);
      ticket.pagar(50, CRIADO_EM);
      vagasRepository.vagas.push(vaga);
      await ticketsRepository.salvar(ticket);

      await expect(sut.execute(ticket.id.toString())).rejects.toThrow(
        DomainException,
      );
    });

    it("deve lançar DomainException ao tentar pagar um ticket cancelado", async () => {
      const vaga = criarVagaOcupada();
      const ticket = criarTicket(vaga.id);
      ticket.cancelar(CRIADO_EM);
      vagasRepository.vagas.push(vaga);
      await ticketsRepository.salvar(ticket);

      await expect(sut.execute(ticket.id.toString())).rejects.toThrow(
        DomainException,
      );
    });

    it("não deve liberar a vaga quando o pagamento falha", async () => {
      const vaga = criarVagaOcupada();
      const ticket = criarTicket(vaga.id);
      ticket.pagar(50, CRIADO_EM);
      vagasRepository.vagas.push(vaga);
      await ticketsRepository.salvar(ticket);

      await expect(sut.execute(ticket.id.toString())).rejects.toThrow();

      const vagaAtualizada = await vagasRepository.buscarPorId(vaga.id);
      expect(vagaAtualizada!.disponivel).toBe(false);
    });
  });

  describe("quando a vaga não pode ser liberada", () => {
    it("deve lançar DomainException ao tentar liberar vaga em manutenção", async () => {
      const vaga = Vaga.rehydrate({
        id: new EntityIdUnico(),
        codigo: "M-01",
        tipo: TipoVaga.MANUTENCAO,
        disponivel: false,
      });
      const ticket = criarTicket(vaga.id);
      vagasRepository.vagas.push(vaga);
      await ticketsRepository.salvar(ticket);

      await expect(sut.execute(ticket.id.toString())).rejects.toThrow(
        DomainException,
      );
    });
  });
});
