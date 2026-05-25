import { Vaga } from "@domain/vaga/entities/vaga.entity.js";
import { TipoVaga } from "@domain/vaga/enums/tipo-vaga.enum.js";
import { EntityIdUnico } from "@domain/vaga/shared/value-objects/entity-id-unico.vo.js";
import { Vaga as PrismaVaga } from "@infra/persistence/prisma/client/client.js";

export class VagaMapper {
  public static fromDomain(vaga: Vaga): PrismaVaga {
    return {
      id: vaga.id.toString(),
      codigo: vaga.codigo,
      tipo: vaga.tipo,
      disponivel: vaga.disponivel,
    };
  }

  public static toDomain(prismaVaga: PrismaVaga): Vaga {
    return Vaga.rehydrate({
      id: new EntityIdUnico(prismaVaga.id),
      codigo: prismaVaga.codigo,
      tipo: prismaVaga.tipo as TipoVaga,
      disponivel: prismaVaga.disponivel,
    });
  }
}
