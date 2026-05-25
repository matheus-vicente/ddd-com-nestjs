import { BadRequestException } from "@nestjs/common";

import { TipoVaga } from "@domain/vaga/enums/tipo-vaga.enum.js";

export type InfosVagaDTOType = {
  codigo: string;
  tipo?: string;
};

export class InfosVagaDTO {
  private constructor(
    private readonly _codigo: string,
    private readonly _tipo?: TipoVaga,
  ) {}

  static validar(data: InfosVagaDTOType): InfosVagaDTO {
    const errors: string[] = [];

    if (typeof data !== "object" || data === null) {
      throw new BadRequestException("Body inválido");
    }

    const body = data;

    if (
      !body.codigo ||
      typeof body.codigo !== "string" ||
      body.codigo.trim() === ""
    ) {
      errors.push("O campo CODIGO deve ser preenchido");
    }

    if (errors.length > 0) {
      throw new BadRequestException({ message: "Dados inválidos", errors });
    }

    const { codigo, tipo } = body;

    const dto = new InfosVagaDTO(
      codigo.trim(),
      tipo ? (tipo.toUpperCase() as TipoVaga) : undefined,
    );

    return dto;
  }

  get codigo(): string {
    return this._codigo;
  }

  get tipo(): TipoVaga | undefined {
    return this._tipo;
  }
}
