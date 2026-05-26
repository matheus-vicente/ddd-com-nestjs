import { randomInt } from "node:crypto";

import { DomainException } from "@domain/exceptions/domain.exception.js";

export class CodigoTicket {
  private readonly valor: string;

  private static readonly CARACTERES_VALIDOS =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  private static FORMATO_CODIGO =
    /^[0-9A-Z]{8}-[0-9A-Z]{8}-[0-9A-Z]{8}-\d{2}\d{2}\d{4}\d{2}\d{2}\d{2}$/;

  constructor(codigo?: string) {
    const resolvedCodigo = codigo ?? this.novoCodigo();

    if (!CodigoTicket.FORMATO_CODIGO.test(resolvedCodigo)) {
      throw new DomainException("Esse cógido não é válido");
    }

    this.valor = resolvedCodigo;
  }

  private novoCodigo(): string {
    let str = "";

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 8; j++) {
        const index = randomInt(0, CodigoTicket.CARACTERES_VALIDOS.length);
        str += CodigoTicket.CARACTERES_VALIDOS.charAt(index);
      }

      str += "-";
    }

    str += this.formatarDataAtual();

    return str;
  }

  private formatarDataAtual(): string {
    const agora = new Date();

    const dia = String(agora.getDate()).padStart(2, "0");
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const ano = agora.getFullYear();
    const hora = String(agora.getHours()).padStart(2, "0");
    const minuto = String(agora.getMinutes()).padStart(2, "0");
    const segundo = String(agora.getSeconds()).padStart(2, "0");

    return `${dia}${mes}${ano}${hora}${minuto}${segundo}`;
  }

  public toString(): string {
    return this.valor;
  }
}
