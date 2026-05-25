import { beforeEach, describe, expect, it } from "vitest";

import { AtualizarInfosVagaUseCase } from "@application/vaga/use-cases/atualizar-infos-vaga.use-case.js";
import { InfosVagaDTO } from "@application/vaga/dtos/infos-vaga.dto.js";
import { TipoVaga } from "@domain/vaga/enums/tipo-vaga.enum.js";
import { InMemoryVagasRepository } from "@infra/persistence/in-memory/in-memory-vagas.repository.js";
import { Vaga } from "@domain/vaga/entities/vaga.entity.js";
import { NaoEncontradoException } from "@domain/vaga/exceptions/nao-encontrado.exception.js";
import { DomainException } from "@domain/vaga/exceptions/domain.exception.js";

describe("AtualizarInfosVagaUseCase", () => {
  let sut: AtualizarInfosVagaUseCase;
  let vagasRepository: InMemoryVagasRepository;

  beforeEach(() => {
    vagasRepository = new InMemoryVagasRepository();
    sut = new AtualizarInfosVagaUseCase(vagasRepository);
  });

  describe("execute", () => {
    it("deve atualizar o código de uma vaga com sucesso", async () => {
      const vagaDTO = InfosVagaDTO.validar({
        codigo: "A-01",
        tipo: TipoVaga.PADRAO,
      });

      const vaga = Vaga.create(vagaDTO);
      vagasRepository.vagas.push(vaga);

      const vagaAtualizadaDTO = InfosVagaDTO.validar({
        codigo: "A-99",
        tipo: TipoVaga.PADRAO,
      });

      const result = await sut.execute(vaga.id, vagaAtualizadaDTO);

      expect(result.id).toBe(vaga.id);
      expect(result.codigo).toBe("A-99");
    });

    it("deve atualizar o tipo de uma vaga com sucesso", async () => {
      const vagaDTO = InfosVagaDTO.validar({
        codigo: "B-01",
        tipo: TipoVaga.PADRAO,
      });

      const vaga = Vaga.create(vagaDTO);
      vagasRepository.vagas.push(vaga);

      const vagaAtualizadaDTO = InfosVagaDTO.validar({
        codigo: "B-01-NOVO",
        tipo: TipoVaga.MANUTENCAO,
      });

      const result = await sut.execute(vaga.id, vagaAtualizadaDTO);

      expect(result.tipo).toBe(TipoVaga.MANUTENCAO);
    });

    it("deve persistir as alterações no repositório", async () => {
      const vaga = Vaga.create({ codigo: "C-01", tipo: TipoVaga.PADRAO });
      vagasRepository.vagas.push(vaga);

      const vagaAtualizadaDTO = InfosVagaDTO.validar({
        codigo: "C-99",
        tipo: TipoVaga.PADRAO,
      });

      await sut.execute(vaga.id, vagaAtualizadaDTO);

      expect(vagasRepository.vagas[0].codigo).toBe("C-99");
    });

    it("deve manter o id e disponível inalterados após atualização", async () => {
      const vaga = Vaga.create({ codigo: "D-01", tipo: TipoVaga.PADRAO });
      vagasRepository.vagas.push(vaga);

      const vagaAtualizadaDTO = InfosVagaDTO.validar({
        codigo: "D-99",
        tipo: TipoVaga.PADRAO,
      });

      const result = await sut.execute(vaga.id, vagaAtualizadaDTO);

      expect(result.id).toBe(vaga.id);
      expect(result.disponivel).toBe(vaga.disponivel);
    });

    it("deve lançar NaoEncontradoException quando vaga não existe", async () => {
      const vagaAtualizadaDTO = InfosVagaDTO.validar({
        codigo: "X-01",
        tipo: TipoVaga.PADRAO,
      });

      await expect(
        sut.execute("id-inexistente", vagaAtualizadaDTO),
      ).rejects.toThrow(NaoEncontradoException);
    });

    it("deve lançar DomainException quando código já está cadastrado em outra vaga", async () => {
      const vagaA = Vaga.create({ codigo: "E-01", tipo: TipoVaga.PADRAO });
      const vagaB = Vaga.create({ codigo: "E-02", tipo: TipoVaga.PADRAO });
      vagasRepository.vagas.push(vagaA, vagaB);

      const vagaAtualizadaDTO = InfosVagaDTO.validar({
        codigo: "E-02",
        tipo: TipoVaga.PADRAO,
      });

      await expect(sut.execute(vagaA.id, vagaAtualizadaDTO)).rejects.toThrow(
        DomainException,
      );
    });

    it("não deve alterar o repositório quando vaga não é encontrada", async () => {
      const vaga = Vaga.create({ codigo: "F-01", tipo: TipoVaga.PADRAO });
      vagasRepository.vagas.push(vaga);

      const vagaAtualizadaDTO = InfosVagaDTO.validar({
        codigo: "F-99",
        tipo: TipoVaga.PADRAO,
      });

      try {
        await sut.execute("id-inexistente", vagaAtualizadaDTO);
      } catch {
        // ignora erro esperado
      }

      expect(vagasRepository.vagas[0].codigo).toBe("F-01");
    });

    it("não deve alterar o repositório quando código já está em uso", async () => {
      const vagaA = Vaga.create({ codigo: "G-01", tipo: TipoVaga.PADRAO });
      const vagaB = Vaga.create({ codigo: "G-02", tipo: TipoVaga.PADRAO });
      vagasRepository.vagas.push(vagaA, vagaB);

      const vagaAtualizadaDTO = InfosVagaDTO.validar({
        codigo: "G-02",
        tipo: TipoVaga.PADRAO,
      });

      try {
        await sut.execute(vagaA.id, vagaAtualizadaDTO);
      } catch {
        // ignora erro esperado
      }

      expect(vagasRepository.vagas[0].codigo).toBe("G-01");
      expect(vagasRepository.vagas[1].codigo).toBe("G-02");
    });
  });
});
