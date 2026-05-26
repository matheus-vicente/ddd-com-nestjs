import { DomainException } from "@domain/exceptions/domain.exception.js";

export class Placa {
  private readonly PLACA_REGEX = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;
  private readonly _placa: string;

  constructor(placa: string) {
    if (!placa) {
      throw new DomainException("O campo PLACA deve ser preenchido");
    }

    const placaLimpa = placa.replace(/[- ]/g, "").toUpperCase();

    if (!this.PLACA_REGEX.test(placaLimpa)) {
      throw new DomainException(
        "Placa inválida. Use o formato ABC-1234 ou ABC1D23",
      );
    }

    this._placa = placaLimpa;
  }

  public toString(): string {
    return this._placa;
  }
}
