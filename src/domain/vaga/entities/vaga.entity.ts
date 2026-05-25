import { TipoVaga } from "@domain/vaga/enums/tipo-vaga.enum.js";
import { DomainException } from "@domain/vaga/exceptions/domain.exception.js";
import { EntityIdUnico } from "../shared/value-objects/entity-id-unico.vo.js";

export interface VagaProps {
  id: EntityIdUnico;
  codigo: string;
  tipo?: TipoVaga;
  disponivel: boolean;
}

export class Vaga {
  private readonly _id: EntityIdUnico;
  private _codigo: string;
  private _tipo: TipoVaga;
  private _disponivel: boolean;

  private constructor({ id, codigo, tipo, disponivel }: VagaProps) {
    if (!codigo || codigo.trim().length === 0) {
      throw new DomainException("O campo CÓDIGO não pode ser nulo");
    }

    this._id = id;
    this._codigo = codigo;
    this._tipo = tipo === undefined ? TipoVaga.PADRAO : tipo;
    this._disponivel = disponivel;
  }

  public static create(props: Omit<VagaProps, "id" | "disponivel">): Vaga {
    const id = new EntityIdUnico();

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
    if (!codigo || codigo.trim().length === 0) {
      throw new DomainException("O campo CÓDIGO não pode ser nulo");
    }

    if (tipo) {
      this._tipo = tipo;
    }

    this._codigo = codigo;
  }

  public get id(): EntityIdUnico {
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
