import { beforeEach, describe, expect, it } from "vitest";

import { CriarVagaUseCase } from "@application/vaga/use-cases/criar-vaga.use-case.js";
import { TipoVaga } from "@domain/vaga/enums/tipo-vaga.enum.js";
import { DomainException } from "@domain/exceptions/domain.exception.js";
import { InMemoryVagasRepository } from "@infra/persistence/in-memory/in-memory-vagas.repository.js";
import { InfosVagaDTO } from "../dtos/infos-vaga.dto.js";

describe("CriarVagaUseCase", () => {
  let sut: CriarVagaUseCase;
  let vagasRepository: InMemoryVagasRepository;

  beforeEach(() => {
    vagasRepository = new InMemoryVagasRepository();
    sut = new CriarVagaUseCase(vagasRepository);
  });

  describe("execute", () => {
    it("deve criar uma vaga com sucesso com tipo padrão", async () => {
      const vagaDTO = InfosVagaDTO.validar({
        codigo: "A-01",
        tipo: TipoVaga.PADRAO,
      });

      const result = await sut.execute(vagaDTO);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.codigo).toBe(vagaDTO.codigo);
      expect(result.tipo).toBe(TipoVaga.PADRAO);
      expect(result.disponivel).toBe(true);
    });

    it("deve criar uma vaga com tipo MANUTENCAO", async () => {
      const vagaDTO = InfosVagaDTO.validar({
        codigo: "B-02",
        tipo: TipoVaga.MANUTENCAO,
      });

      const result = await sut.execute(vagaDTO);

      expect(result).toBeDefined();
      expect(result.codigo).toBe(vagaDTO.codigo);
      expect(result.tipo).toBe(TipoVaga.MANUTENCAO);
      expect(result.disponivel).toBe(true);
    });

    it("deve criar uma vaga sem tipo e usar PADRAO como padrão", async () => {
      const vagaDTO = InfosVagaDTO.validar({
        codigo: "C-03",
      });

      const result = await sut.execute(vagaDTO);

      expect(result.tipo).toBe(TipoVaga.PADRAO);
    });

    it("deve persistir a vaga no repositório após criação", async () => {
      const vagaDTO = InfosVagaDTO.validar({
        codigo: "D-04",
        tipo: TipoVaga.PADRAO,
      });

      const result = await sut.execute(vagaDTO);

      expect(vagasRepository.vagas).toHaveLength(1);
      expect(vagasRepository.vagas[0].id).toBe(result.id);
    });

    it("deve lançar DomainException quando código já está cadastrado", async () => {
      const vagaDTO: InfosVagaDTO = InfosVagaDTO.validar({
        codigo: "A-01",
        tipo: TipoVaga.PADRAO,
      });

      await sut.execute(vagaDTO);

      await expect(sut.execute(vagaDTO)).rejects.toThrow(DomainException);
      await expect(sut.execute(vagaDTO)).rejects.toThrow(
        "Este código já está cadastrado",
      );
    });

    it("não deve criar segunda vaga com mesmo código", async () => {
      const vagaDTO = InfosVagaDTO.validar({
        codigo: "A-01",
        tipo: TipoVaga.PADRAO,
      });

      await sut.execute(vagaDTO);

      await expect(sut.execute(vagaDTO)).rejects.toThrow(DomainException);
    });

    it("deve permitir criar múltiplas vagas com códigos distintos", async () => {
      const vagaDTO1 = InfosVagaDTO.validar({
        codigo: "A-01",
        tipo: TipoVaga.PADRAO,
      });

      const vagaDTO2 = InfosVagaDTO.validar({
        codigo: "A-02",
        tipo: TipoVaga.PADRAO,
      });

      const vagaDTO3 = InfosVagaDTO.validar({
        codigo: "A-03",
        tipo: TipoVaga.PADRAO,
      });

      await sut.execute(vagaDTO1);
      await sut.execute(vagaDTO2);
      await sut.execute(vagaDTO3);

      expect(vagasRepository.vagas).toHaveLength(3);
    });

    it("deve retornar a vaga com disponível igual a true por padrão", async () => {
      const vagaDTO = InfosVagaDTO.validar({
        codigo: "E-05",
        tipo: TipoVaga.PADRAO,
      });

      const result = await sut.execute(vagaDTO);

      expect(result.disponivel).toBe(true);
    });

    it("deve gerar IDs únicos para vagas distintas", async () => {
      const vagaDTO1 = InfosVagaDTO.validar({
        codigo: "E-05",
        tipo: TipoVaga.PADRAO,
      });

      const vagaDTO2 = InfosVagaDTO.validar({
        codigo: "E-06",
        tipo: TipoVaga.PADRAO,
      });

      const vaga1 = await sut.execute(vagaDTO1);
      const vaga2 = await sut.execute(vagaDTO2);

      expect(vaga1.id).not.toBe(vaga2.id);
    });
  });
});
