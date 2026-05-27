import { beforeEach, describe, expect, it } from "vitest";

import { InfosTicketDTO } from "@application/ticket/dtos/infos-ticket.dto.js";
import { GerarTicketUseCase } from "@application/ticket/use-cases/gerar-ticket.use-case.js";
import { Vaga } from "@domain/vaga/entities/vaga.entity.js";
import { TipoTarifa } from "@domain/ticket/enums/tipo-tarifa.enum.js";
import { StatusTicket } from "@domain/ticket/enums/status-ticket.enum.js";
import { EntityIdUnico } from "@domain/shared/value-objects/entity-id-unico.vo.js";
import { NaoEncontradoException } from "@domain/exceptions/nao-encontrado.exception.js";
import { InMemoryVagasRepository } from "@infra/persistence/in-memory/in-memory-vagas.repository.js";
import { InMemoryTicketsRepository } from "@infra/persistence/in-memory/in-memory-tickets.repository.js";

function criarVagaDisponivel(): Vaga {
  return Vaga.create({ codigo: "A-01" });
}

function criarVagaOcupada(): Vaga {
  const vaga = Vaga.create({ codigo: "B-02" });
  vaga.ocupar();
  return vaga;
}

function buildDTO(
  overrides: Partial<ConstructorParameters<typeof InfosTicketDTO>[0]> = {},
): InfosTicketDTO {
  return new InfosTicketDTO({
    placa: "ABC-1234",
    tipo: TipoTarifa.DIARIA,
    valor: 50,
    ...overrides,
  });
}

describe("GerarTicketUseCase", () => {
  let vagasRepository: InMemoryVagasRepository;
  let ticketsRepository: InMemoryTicketsRepository;
  let clock: Date;
  let sut: GerarTicketUseCase;

  beforeEach(() => {
    vagasRepository = new InMemoryVagasRepository();
    ticketsRepository = new InMemoryTicketsRepository();
    clock = new Date("2024-06-01T10:00:00.000Z");

    sut = new GerarTicketUseCase(
      vagasRepository,
      ticketsRepository,
      () => clock,
    );
  });

  describe("quando os dados são válidos", () => {
    it("deve criar e persistir o ticket corretamente", async () => {
      const vaga = criarVagaDisponivel();
      vagasRepository.vagas.push(vaga);

      const dto = buildDTO();

      const ticket = await sut.execute(vaga.id.toString(), dto);

      expect(ticket).toBeDefined();
      expect(ticket.status).toBe(StatusTicket.PENDENTE);
      expect(ticket.placa.toString()).toBe("ABC1234");
      expect(ticket.vagaId.toString()).toBe(vaga.id.toString());
      expect(ticket.criadoEm).toEqual(clock);
    });

    it("deve salvar o ticket no repositório", async () => {
      const vaga = criarVagaDisponivel();
      vagasRepository.vagas.push(vaga);

      const dto = buildDTO();

      const ticket = await sut.execute(vaga.id.toString(), dto);

      const ticketSalvo = await ticketsRepository.buscarPorId(ticket.id);
      expect(ticketSalvo).not.toBeNull();
      expect(ticketSalvo!.id.equals(ticket.id)).toBe(true);
    });

    it("deve marcar a vaga como indisponível após gerar o ticket", async () => {
      const vaga = criarVagaDisponivel();
      vagasRepository.vagas.push(vaga);

      expect(vaga.disponivel).toBe(true);

      await sut.execute(vaga.id.toString(), buildDTO());

      const vagaAtualizada = await vagasRepository.buscarPorId(vaga.id);
      expect(vagaAtualizada!.disponivel).toBe(false);
    });

    it("deve criar ticket com tarifa MENSAL corretamente", async () => {
      const vaga = criarVagaDisponivel();
      vagasRepository.vagas.push(vaga);

      const dto = buildDTO({ tipo: TipoTarifa.MENSAL, valor: 300 });

      const ticket = await sut.execute(vaga.id.toString(), dto);

      expect(ticket.tarifa).toBeDefined();
    });

    it("deve criar ticket com tarifa PRIMEIRA_HORA_MAIS_HORA_ADICIONAL corretamente", async () => {
      const vaga = criarVagaDisponivel();
      vagasRepository.vagas.push(vaga);

      const dto = buildDTO({
        tipo: TipoTarifa.PRIMEIRA_HORA_MAIS_HORA_ADICIONAL,
        valor: 15,
        valorAdicional: 8,
      });

      const ticket = await sut.execute(vaga.id.toString(), dto);

      expect(ticket.tarifa).toBeDefined();
    });

    it("deve gerar tickets com IDs únicos a cada execução", async () => {
      const vaga1 = criarVagaDisponivel();
      const vaga2 = Vaga.create({ codigo: "C-03" });
      vagasRepository.vagas.push(vaga1, vaga2);

      const ticket1 = await sut.execute(vaga1.id.toString(), buildDTO());
      const ticket2 = await sut.execute(vaga2.id.toString(), buildDTO());

      expect(ticket1.id.toString()).not.toBe(ticket2.id.toString());
    });
  });

  describe("quando a vaga não é encontrada", () => {
    it("deve lançar NaoEncontradoException para um ID inexistente", async () => {
      const idInexistente = new EntityIdUnico().toString();

      await expect(sut.execute(idInexistente, buildDTO())).rejects.toThrow(
        NaoEncontradoException,
      );
    });

    it("deve incluir mensagem descritiva na exceção", async () => {
      const idInexistente = new EntityIdUnico().toString();

      await expect(sut.execute(idInexistente, buildDTO())).rejects.toThrow(
        "Vaga não encontrada",
      );
    });

    it("não deve salvar nenhum ticket quando a vaga não existe", async () => {
      const idInexistente = new EntityIdUnico().toString();

      await expect(sut.execute(idInexistente, buildDTO())).rejects.toThrow();

      const tickets = await ticketsRepository.listar();
      expect(tickets).toHaveLength(0);
    });
  });

  describe("quando a vaga está ocupada", () => {
    it("deve lançar erro ao tentar ocupar uma vaga já ocupada", async () => {
      const vaga = criarVagaOcupada();
      vagasRepository.vagas.push(vaga);

      await expect(sut.execute(vaga.id.toString(), buildDTO())).rejects.toThrow(
        "Vaga já está ocupada",
      );
    });

    it("não deve salvar ticket quando a vaga está ocupada", async () => {
      const vaga = criarVagaOcupada();
      vagasRepository.vagas.push(vaga);

      await expect(
        sut.execute(vaga.id.toString(), buildDTO()),
      ).rejects.toThrow();

      const tickets = await ticketsRepository.listar();
      expect(tickets).toHaveLength(0);
    });
  });

  describe("uso do clock injetado", () => {
    it("deve usar a data do clock como criadoEm do ticket", async () => {
      const dataEsperada = new Date("2024-01-15T08:30:00.000Z");
      const sutComClock = new GerarTicketUseCase(
        vagasRepository,
        ticketsRepository,
        () => dataEsperada,
      );

      const vaga = criarVagaDisponivel();
      vagasRepository.vagas.push(vaga);

      const ticket = await sutComClock.execute(vaga.id.toString(), buildDTO());

      expect(ticket.criadoEm).toEqual(dataEsperada);
    });

    it("deve lançar erro quando a data do clock está no futuro", async () => {
      const dataFutura = new Date(Date.now() + 1_000_000_000);
      const sutComClockFuturo = new GerarTicketUseCase(
        vagasRepository,
        ticketsRepository,
        () => dataFutura,
      );

      const vaga = criarVagaDisponivel();
      vagasRepository.vagas.push(vaga);

      await expect(
        sutComClockFuturo.execute(vaga.id.toString(), buildDTO()),
      ).rejects.toThrow("O campo CRIADO_EM não pode ser no futuro");
    });
  });
});
