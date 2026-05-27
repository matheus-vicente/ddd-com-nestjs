import { BadRequestException } from "@nestjs/common";

import { TipoTarifa } from "@domain/ticket/enums/tipo-tarifa.enum.js";

export type InfosTicketDTOType = {
  placa: string;
  tipo: TipoTarifa;
  valor: number;
  valorAdicional?: number;
};

export class InfosTicketDTO {
  private readonly _placa: string;
  private readonly _tipo: TipoTarifa;
  private readonly _valor: number;
  private readonly _valorAdicional?: number;

  constructor(data: InfosTicketDTOType) {
    const message: string[] = ["Dados inválidos"];

    if (typeof data !== "object" || data === null) {
      throw new BadRequestException("Body inválido");
    }

    const { placa, tipo, valor, valorAdicional } = data;

    if (!placa || typeof placa !== "string" || placa.trim() === "") {
      message.push("O campo PLACA deve ser preenchido");
    }

    const tiposValidos = Object.values(TipoTarifa);

    if (
      !tipo ||
      (!!tipo && !tiposValidos.includes(tipo.toUpperCase() as TipoTarifa))
    ) {
      message.push(
        `O campo TIPO_TARIFA deve ser preenchido e deve ser um dos seguintes valores: ${tiposValidos.join(", ")}`,
      );
    }

    if (!valor || typeof valor !== "number" || valor < 0) {
      message.push("O campo VALOR deve ser preenchido com um valor válido");
    }

    if (
      !!valorAdicional &&
      (typeof valorAdicional !== "number" || valorAdicional < 0)
    ) {
      message.push(
        "O campo VALOR_ADICIONAL deve ser preenchido com um valor válido",
      );
    }

    if (message.length > 1) {
      throw new BadRequestException(message);
    }

    this._placa = placa;
    this._tipo = tipo;
    this._valor = valor;
    this._valorAdicional = valorAdicional ?? undefined;
  }

  get placa(): string {
    return this._placa;
  }

  get tipo(): TipoTarifa {
    return this._tipo;
  }

  get valor(): number {
    return this._valor;
  }

  get valorAdicional(): number | undefined {
    return this._valorAdicional;
  }
}
