import { DomainException } from "@domain/exceptions/domain.exception.js";
import { Ticket } from "@domain/ticket/entities/ticket.entity.js";
import { TipoTarifa } from "@domain/ticket/enums/tipo-tarifa.enum.js";

export class CalcularTarifaService {
  public calcular(ticket: Ticket, dataDeSaida: Date): number {
    const permanencia = this.duracaoEmMiliSegundos(
      ticket.criadoEm,
      dataDeSaida,
    );

    const tarifa = ticket.tarifa;

    switch (tarifa.tipo) {
      case TipoTarifa.DIARIA: {
        return tarifa.valor;
      }
      case TipoTarifa.MENSAL: {
        return tarifa.valor;
      }
      case TipoTarifa.PRIMEIRA_HORA_MAIS_HORA_ADICIONAL: {
        return this.calcularHoraAdicional(
          permanencia,
          tarifa.valor,
          tarifa.valorAdicional,
        );
      }
      default: {
        throw new DomainException("Erro interno");
      }
    }
  }

  private duracaoEmMiliSegundos(dataInicio: Date, dataFim: Date): number {
    return dataFim.getTime() - dataInicio.getTime();
  }

  private calcularHoraAdicional(
    permanencia: number,
    valorPrimeiraHora: number,
    valorAdicional: number,
  ): number {
    const horas = Math.floor(permanencia / (1000 * 60 * 60));

    if (horas < 1) {
      const minutos = Math.floor(permanencia / (1000 * 60));

      if (minutos < 15) {
        return 0;
      }

      return valorPrimeiraHora;
    }

    return valorPrimeiraHora + (horas - 1) * valorAdicional;
  }
}
