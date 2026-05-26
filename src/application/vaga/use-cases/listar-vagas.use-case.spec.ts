import { beforeEach, describe, expect, it } from "vitest";

import { ListarVagasUseCase } from "@application/vaga/use-cases/listar-vagas.use-case.js";
import { InMemoryVagasRepository } from "@infra/persistence/in-memory/in-memory-vagas.repository.js";
import { Vaga } from "@domain/vaga/entities/vaga.entity.js";
import { TipoVaga } from "@domain/vaga/enums/tipo-vaga.enum.js";
import { InfosVagaDTO } from "@application/vaga/dtos/infos-vaga.dto.js";

describe("ListarVagasUseCase", () => {
  let sut: ListarVagasUseCase;
  let vagasRepository: InMemoryVagasRepository;

  beforeEach(() => {
    vagasRepository = new InMemoryVagasRepository();
    sut = new ListarVagasUseCase(vagasRepository);
  });

  describe("execute", () => {
    it("deve retornar uma lista vazia quando não há vagas cadastradas", async () => {
      const result = await sut.execute();

      expect(result).toBeDefined();
      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it("deve retornar todas as vagas cadastradas", async () => {
      const vagaDTO1 = new InfosVagaDTO({
        codigo: "A-01",
        tipo: TipoVaga.PADRAO,
      });

      const vagaDTO2 = new InfosVagaDTO({
        codigo: "A-02",
        tipo: TipoVaga.PADRAO,
      });

      const vagaDTO3 = new InfosVagaDTO({
        codigo: "A-03",
        tipo: TipoVaga.PADRAO,
      });

      vagasRepository.vagas.push(
        Vaga.create({ codigo: vagaDTO1.codigo, tipo: vagaDTO1.tipo }),
        Vaga.create({ codigo: vagaDTO2.codigo, tipo: vagaDTO2.tipo }),
        Vaga.create({ codigo: vagaDTO3.codigo, tipo: vagaDTO3.tipo }),
      );

      const result = await sut.execute();

      expect(result).toHaveLength(3);
    });

    it("deve retornar uma lista contendo instâncias de Vaga", async () => {
      const vagaDTO = new InfosVagaDTO({
        codigo: "B-01",
        tipo: TipoVaga.PADRAO,
      });

      vagasRepository.vagas.push(
        Vaga.create({ codigo: vagaDTO.codigo, tipo: vagaDTO.tipo }),
      );

      const result = await sut.execute();

      expect(result[0]).toBeInstanceOf(Vaga);
    });

    it("deve retornar vagas com os dados corretos", async () => {
      const vagaDTO = new InfosVagaDTO({
        codigo: "C-01",
        tipo: TipoVaga.MANUTENCAO,
      });

      const vaga = Vaga.create({ codigo: vagaDTO.codigo, tipo: vagaDTO.tipo });

      vagasRepository.vagas.push(vaga);

      const result = await sut.execute();

      expect(result[0].id).toBe(vaga.id);
      expect(result[0].codigo).toBe("C-01");
      expect(result[0].tipo).toBe(TipoVaga.MANUTENCAO);
      expect(result[0].disponivel).toBe(true);
    });

    it("deve refletir vagas adicionadas ao repositório em chamadas subsequentes", async () => {
      const resultAntes = await sut.execute();
      expect(resultAntes).toHaveLength(0);

      const vagaDTO = new InfosVagaDTO({
        codigo: "D-01",
        tipo: TipoVaga.MANUTENCAO,
      });

      vagasRepository.vagas.push(
        Vaga.create({ codigo: vagaDTO.codigo, tipo: vagaDTO.tipo }),
      );

      const resultDepois = await sut.execute();
      expect(resultDepois).toHaveLength(1);
    });
  });
});
