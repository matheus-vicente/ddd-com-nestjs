import { EntityIdUnicoVO } from "@domain/shared/value-objects/entity-id-unico.vo.js";
import { StatusTicket } from "@domain/ticket/enums/status-ticket.enum.js";
import { Placa } from "@domain/ticket/value-objects/placa.vo.js";
import { Tarifa } from "@domain/ticket/value-objects/tarifa.vo.js";
import { CodigoTicket } from "@domain/ticket/value-objects/codigo-ticket.vo.js";
import { DomainException } from "@domain/exceptions/domain.exception.js";
import { TipoTarifa } from "@domain/ticket/enums/tipo-tarifa.enum.js";

export interface TicketProps {
  id: EntityIdUnicoVO;
  codigo: CodigoTicket;
  vagaId: string;
  status: StatusTicket;
  placa: Placa;
  tarifa: Tarifa;
  valor: number;
  criadoEm: Date;
  dataDeSaida?: Date;
}

export interface CreateTicketProps {
  vagaId: string;
  placa: string;
  tipoTarifa: TipoTarifa;
  valor: number;
  valorAdicional?: number;
  criadoEm: Date;
}

export interface RehydrateTarifa {
  id: string;
  codigo: string;
  vagaId: string;
  status: StatusTicket;
  placa: string;
  tipoTarifa: TipoTarifa;
  valorTarifa: number;
  valorAdicionalTarifa: number;
  valor: number;
  criadoEm: Date;
  dataDeSaida?: Date;
}

export class Ticket {
  private readonly _id: EntityIdUnicoVO;
  private _codigo: CodigoTicket;
  private _vagaId: string;
  private _status: StatusTicket;
  private _placa: Placa;
  private _tarifa: Tarifa;
  private _valor: number;
  private _criadoEm: Date;
  private _dataDeSaida?: Date;

  private constructor({
    id,
    codigo,
    vagaId,
    status,
    placa,
    tarifa,
    valor,
    criadoEm,
    dataDeSaida,
  }: TicketProps) {
    if (criadoEm.getTime() > Date.now()) {
      throw new DomainException("O campo CRIADO_EM não pode ser no futuro");
    }

    this._id = id;
    this._codigo = codigo;
    this._vagaId = vagaId;
    this._status = status;
    this._placa = placa;
    this._tarifa = tarifa;
    this._valor = valor;
    this._criadoEm = criadoEm;
    this._dataDeSaida = dataDeSaida;
  }

  public static create({
    placa,
    valor,
    vagaId,
    tipoTarifa,
    valorAdicional,
    criadoEm,
  }: CreateTicketProps): Ticket {
    const id = new EntityIdUnicoVO();
    const codigo = new CodigoTicket();
    const tarifa = this.mapearTarifa(tipoTarifa, valor, valorAdicional);

    return new Ticket({
      id,
      codigo,
      placa: new Placa(placa),
      status: StatusTicket.PENDENTE,
      valor: 0,
      vagaId,
      tarifa,
      criadoEm,
    });
  }

  public static rehydrate(props: RehydrateTarifa): Ticket {
    const tarifa: Tarifa = this.mapearTarifa(
      props.tipoTarifa,
      props.valorTarifa,
      props.valorAdicionalTarifa,
    );

    return new Ticket({
      ...props,
      id: new EntityIdUnicoVO(props.id),
      codigo: new CodigoTicket(props.codigo),
      placa: new Placa(props.placa),
      tarifa,
    });
  }

  public pagar(valor: number, dataDeSaida: Date): void {
    if (this._status === StatusTicket.CANCELADO) {
      throw new DomainException("Não é possível pagar um Ticket cancelado");
    }

    if (this._status === StatusTicket.PAGO) {
      throw new DomainException("Este Ticket já está pago");
    }

    if (valor === null || valor < 0) {
      throw new DomainException(
        "O valor da tarifa não pode ser negativo ou nulo",
      );
    }

    if (dataDeSaida.getTime() < this._criadoEm.getTime()) {
      throw new DomainException(
        "A data de pagamento não pode ser antes da data de criação",
      );
    }

    this._status = StatusTicket.PAGO;
    this._valor = valor;
    this._dataDeSaida = dataDeSaida;
  }

  public cancelar(dataDeSaida: Date): void {
    if (this._status === StatusTicket.CANCELADO) {
      throw new DomainException("Este Ticket já está cancelado");
    }

    if (this._status === StatusTicket.PAGO) {
      throw new DomainException("Não é possível cancelar um Ticket pago");
    }

    if (dataDeSaida.getTime() < this._criadoEm.getTime()) {
      throw new DomainException(
        "A data de cancelamento não pode ser antes da data de criação",
      );
    }

    this._status = StatusTicket.CANCELADO;
    this._dataDeSaida = dataDeSaida;
  }

  private static mapearTarifa(
    tipoTarifa: TipoTarifa,
    valor: number,
    valorAdicional?: number,
  ): Tarifa {
    switch (tipoTarifa) {
      case TipoTarifa.DIARIA: {
        return Tarifa.fromDiaria(valor);
      }
      case TipoTarifa.MENSAL: {
        return Tarifa.fromMensal(valor);
      }
      case TipoTarifa.PRIMEIRA_HORA_MAIS_HORA_ADICIONAL: {
        if (!valorAdicional || valorAdicional < 0) {
          throw new DomainException(
            "O campo VALOR_ADICIONAL informado para este tipo de tarifa",
          );
        }

        return Tarifa.fromHoraAdicional(valor, valorAdicional);
      }

      default: {
        throw new DomainException("Informe uma tarifa válida");
      }
    }
  }

  get id(): EntityIdUnicoVO {
    return this._id;
  }
  get codigo(): CodigoTicket {
    return this._codigo;
  }
  get vagaId(): string {
    return this._vagaId;
  }
  get status(): StatusTicket {
    return this._status;
  }
  get placa(): Placa {
    return this._placa;
  }
  get tarifa(): Tarifa {
    return this._tarifa;
  }
  get valor(): number {
    return this._valor;
  }
  get criadoEm(): Date {
    return this._criadoEm;
  }
  get dataDeSaida(): Date | undefined {
    return this._dataDeSaida;
  }
}
