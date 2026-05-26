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
    const message: string[] = ["Dados inválidos"];

    if (typeof data !== "object" || data === null) {
      throw new BadRequestException("Body inválido");
    }

    const body = data;

    if (
      !body.codigo ||
      typeof body.codigo !== "string" ||
      body.codigo.trim() === ""
    ) {
      message.push("O campo CODIGO deve ser preenchido");
    }

    const tiposValidos = Object.values(TipoVaga);

    if (
      !!body.tipo &&
      !tiposValidos.includes(body.tipo.toUpperCase() as TipoVaga)
    ) {
      message.push(
        `O campo TIPO deve ser um dos seguintes valores: ${tiposValidos.join(", ")}`,
      );
    }

    if (message.length > 1) {
      throw new BadRequestException({
        message,
      });
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
