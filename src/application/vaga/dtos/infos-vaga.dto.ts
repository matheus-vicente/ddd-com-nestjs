import { BadRequestException } from "@nestjs/common";

import { TipoVaga } from "@domain/vaga/enums/tipo-vaga.enum.js";

export type InfosVagaDTOType = {
  codigo: string;
  tipo?: string;
};

export class InfosVagaDTO {
  private readonly _codigo: string;
  private readonly _tipo?: TipoVaga;

  constructor(data: InfosVagaDTOType) {
    const message: string[] = ["Dados inválidos"];

    if (typeof data !== "object" || data === null) {
      throw new BadRequestException("Body inválido");
    }

    const { codigo, tipo } = data;

    if (!codigo || typeof codigo !== "string" || codigo.trim() === "") {
      message.push("O campo CODIGO deve ser preenchido");
    }

    const tiposValidos = Object.values(TipoVaga);

    if (!!tipo && !tiposValidos.includes(tipo.toUpperCase() as TipoVaga)) {
      message.push(
        `O campo TIPO deve ser um dos seguintes valores: ${tiposValidos.join(", ")}`,
      );
    }

    if (message.length > 1) {
      throw new BadRequestException({
        message,
      });
    }

    this._codigo = codigo.trim();
    this._tipo = tipo ? (tipo.toUpperCase() as TipoVaga) : undefined;
  }

  get codigo(): string {
    return this._codigo;
  }

  get tipo(): TipoVaga | undefined {
    return this._tipo;
  }
}
