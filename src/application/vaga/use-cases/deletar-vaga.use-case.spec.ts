import { beforeEach, describe, expect, it } from "vitest";

import { Vaga } from "@domain/vaga/entities/vaga.entity.js";
import { DeletarVagaUseCase } from "./deletar-vaga.use-case.js";
import { InMemoryVagasRepository } from "@infra/persistence/in-memory/in-memory-vagas.repository.js";
import { TipoVaga } from "@domain/vaga/enums/tipo-vaga.enum.js";
import { NaoEncontradoException } from "@domain/exceptions/nao-encontrado.exception.js";
import { DomainException } from "@domain/exceptions/domain.exception.js";

describe("DeletarVagaUseCase", () => {
  let sut: DeletarVagaUseCase;
  let vagasRepository: InMemoryVagasRepository;

  beforeEach(() => {
    vagasRepository = new InMemoryVagasRepository();
    sut = new DeletarVagaUseCase(vagasRepository);
  });

  describe("execute", () => {
    it("deve deletar uma vaga disponível com sucesso", async () => {
      const vaga = Vaga.create({ codigo: "A-01", tipo: TipoVaga.PADRAO });
      vagasRepository.vagas.push(vaga);

      await sut.execute(vaga.id.toString().toString());

      expect(vagasRepository.vagas).toHaveLength(0);
    });

    it("deve retornar void após deletar com sucesso", async () => {
      const vaga = Vaga.create({ codigo: "B-01", tipo: TipoVaga.PADRAO });
      vagasRepository.vagas.push(vaga);

      const result = await sut.execute(vaga.id.toString().toString());

      expect(result).toBeUndefined();
    });

    it("deve deletar apenas a vaga alvo, mantendo as demais", async () => {
      const vagaA = Vaga.create({ codigo: "C-01", tipo: TipoVaga.PADRAO });
      const vagaB = Vaga.create({ codigo: "C-02", tipo: TipoVaga.PADRAO });
      const vagaC = Vaga.create({ codigo: "C-03", tipo: TipoVaga.PADRAO });
      vagasRepository.vagas.push(vagaA, vagaB, vagaC);

      await sut.execute(vagaB.id.toString());

      expect(vagasRepository.vagas).toHaveLength(2);
      expect(
        vagasRepository.vagas.find((v) => v.id === vagaB.id),
      ).toBeUndefined();
      expect(
        vagasRepository.vagas.find((v) => v.id === vagaA.id),
      ).toBeDefined();
      expect(
        vagasRepository.vagas.find((v) => v.id === vagaC.id),
      ).toBeDefined();
    });

    it("deve lançar NaoEncontradoException quando vaga não existe", async () => {
      const idInexistente = crypto.randomUUID();

      await expect(sut.execute(idInexistente)).rejects.toThrow(
        NaoEncontradoException,
      );
    });

    it("deve lançar DomainException quando vaga está ocupada", async () => {
      const vaga = Vaga.create({ codigo: "D-01", tipo: TipoVaga.PADRAO });
      vaga.ocupar();
      vagasRepository.vagas.push(vaga);

      await expect(sut.execute(vaga.id.toString())).rejects.toThrow(
        DomainException,
      );
      await expect(sut.execute(vaga.id.toString())).rejects.toThrow(
        "Não é possível deletar uma vaga ocupada",
      );
    });

    it("não deve remover nenhuma vaga do repositório quando vaga está ocupada", async () => {
      const vaga = Vaga.create({ codigo: "E-01", tipo: TipoVaga.PADRAO });
      vaga.ocupar();
      vagasRepository.vagas.push(vaga);

      await expect(sut.execute(vaga.id.toString())).rejects.toThrow(
        DomainException,
      );

      try {
        await sut.execute(vaga.id.toString());
      } catch {
        // ignora erro esperado
      }

      expect(vagasRepository.vagas).toHaveLength(1);
    });

    it("deve lançar Error quando id não é um UUID válido", async () => {
      await expect(sut.execute("id-invalido")).rejects.toThrow(Error);
      await expect(sut.execute("id-invalido")).rejects.toThrow(
        "Este ID não é válido",
      );
    });

    it("deve lançar Error quando id é uma string vazia", async () => {
      await expect(sut.execute("")).rejects.toThrow("Este ID não é válido");
    });
  });
});
