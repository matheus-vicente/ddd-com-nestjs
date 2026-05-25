import { randomUUID } from "node:crypto";

import { TipoVaga } from "@domain/vaga/enums/tipo-vaga.enum.js";
import { DomainException } from "@domain/vaga/exceptions/domain.exception.js";

export interface VagaProps {
  id: string;
  codigo: string;
  tipo?: TipoVaga;
  disponivel: boolean;
}

export class Vaga {
  private readonly _id: string;
  private _codigo: string;
  private _tipo: TipoVaga;
  private _disponivel: boolean;

  private constructor({ id, codigo, tipo, disponivel }: VagaProps) {
    if (!id || id.length === 0) {
      throw new DomainException("O campo ID não pode ser nulo");
    }

    if (codigo === null) {
      throw new DomainException("O campo CÓDIGO não pode ser nulo");
    }

    this._id = id;
    this._codigo = codigo;
    this._tipo = tipo === undefined ? TipoVaga.PADRAO : tipo;
    this._disponivel = disponivel;
  }

  public static create(props: Omit<VagaProps, "id" | "disponivel">): Vaga {
    const id = randomUUID();
    const disponivel = true;

    return new Vaga({ id, disponivel, ...props });
  }

  public static rehydrate(props: VagaProps): Vaga {
    return new Vaga(props);
  }

  public ocupar(): void {
    if (this._tipo === TipoVaga.MANUTENCAO) {
      throw new DomainException("Vaga em manutenção");
    }

    if (!this._disponivel) {
      throw new DomainException("Vaga já está ocupada");
    }

    this._disponivel = false;
  }

  public liberar(): void {
    if (this._tipo === TipoVaga.MANUTENCAO) {
      throw new DomainException("Vaga em manutenção");
    }

    if (this.disponivel) {
      throw new DomainException("Vaga já está livre");
    }

    this._disponivel = true;
  }

  public atualizarInfos({
    codigo,
    tipo,
  }: Omit<VagaProps, "id" | "disponivel">): void {
    if (!codigo) {
      throw new DomainException("O campo CÓDIGO não pode ser nulo");
    }

    if (tipo) {
      this._tipo = tipo;
    }

    this._codigo = codigo;
  }

  public get id(): string {
    return this._id;
  }

  public get codigo(): string {
    return this._codigo;
  }

  public get tipo(): TipoVaga {
    return this._tipo;
  }

  public get disponivel(): boolean {
    return this._disponivel;
  }
}
