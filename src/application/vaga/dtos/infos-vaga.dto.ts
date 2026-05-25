import { BadRequestException } from "@nestjs/common";

import { TipoVaga } from "@domain/vaga/enums/tipo-vaga.enum.js";

type InfosVagaDTOType = {
  codigo: string;
  tipo: string;
};

export class InfosVagaDTO {
  private constructor(
    private readonly _codigo: string,
    private readonly _tipo: TipoVaga,
  ) {}

  static validar(data: unknown): InfosVagaDTO {
    const errors: string[] = [];

    if (typeof data !== "object" || data === null) {
      throw new BadRequestException("Body inválido");
    }

    const body = data as InfosVagaDTOType;

    if (
      !body.codigo ||
      typeof body.codigo !== "string" ||
      body.codigo.trim() === ""
    ) {
      errors.push("codigo: obrigatório e deve ser uma string não vazia");
    }

    const tiposValidos = Object.values(TipoVaga);
    if (
      !body.tipo.toUpperCase ||
      !tiposValidos.includes(body.tipo.toUpperCase() as TipoVaga)
    ) {
      errors.push(`tipo: deve ser um dos valores: ${tiposValidos.join(", ")}`);
    }

    if (errors.length > 0) {
      throw new BadRequestException({ message: "Dados inválidos", errors });
    }

    const dto = new InfosVagaDTO(
      body.codigo.trim(),
      body.tipo.toUpperCase() as TipoVaga,
    );

    return dto;
  }

  get codigo(): string {
    return this._codigo;
  }

  get tipo(): TipoVaga {
    return this._tipo;
  }
}
