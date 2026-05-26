import { DomainException } from "@domain/exceptions/domain.exception.js";
import { TipoTarifa } from "@domain/ticket/enums/tipo-tarifa.enum.js";

export interface TarifaProps {
  tipo: TipoTarifa;
  valor: number;
  valorAdicional: number;
}

export class Tarifa {
  private _tipo: TipoTarifa;
  private _valor: number;
  private _valorAdicional: number;

  private constructor({ tipo, valor, valorAdicional }: TarifaProps) {
    this._tipo = tipo;
    this._valor = valor;
    this._valorAdicional = valorAdicional;
  }

  public static fromDiaria(valor: number): Tarifa {
    this.validarValor(valor);

    return new Tarifa({
      tipo: TipoTarifa.DIARIA,
      valor,
      valorAdicional: 0,
    });
  }

  public static fromMensal(valor: number): Tarifa {
    this.validarValor(valor);

    return new Tarifa({
      tipo: TipoTarifa.MENSAL,
      valor,
      valorAdicional: 0,
    });
  }

  public static fromHoraAdicional(
    valor: number,
    valorAdicional: number,
  ): Tarifa {
    this.validarValor(valor);
    this.validarValor(valorAdicional);

    return new Tarifa({
      tipo: TipoTarifa.PRIMEIRA_HORA_MAIS_HORA_ADICIONAL,
      valor,
      valorAdicional,
    });
  }

  private static validarValor(valor: number): void {
    if (valor === null || valor < 0) {
      throw new DomainException(
        "O valor da tarifa, ou valor adicional, não pode ser negativo ou nulo",
      );
    }
  }

  get tipo(): TipoTarifa {
    return this._tipo;
  }

  get valor(): number {
    return this._valor;
  }

  get valorAdicional(): number {
    return this._valorAdicional;
  }
}
