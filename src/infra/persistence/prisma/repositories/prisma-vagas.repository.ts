import { Injectable } from "@nestjs/common";

import { IVagasRepository } from "@domain/vaga/repositories/vagas.repository.js";
import { PrismaService } from "@infra/persistence/prisma/prisma.service.js";
import { Vaga } from "@domain/vaga/entities/vaga.entity.js";
import { VagaMapper } from "@infra/persistence/prisma/mappers/vaga.mapper.js";

@Injectable()
export class PrismaVagasRepository implements IVagasRepository {
  constructor(private readonly prisma: PrismaService) {}

  async buscarPorId(id: string): Promise<Vaga | null> {
    const prismaVaga = await this.prisma.vaga.findUnique({
      where: { id },
    });

    if (!prismaVaga) {
      return null;
    }

    return VagaMapper.toDomain(prismaVaga);
  }

  public async buscarPorCodigo(codigo: string): Promise<Vaga | null> {
    const prismaVaga = await this.prisma.vaga.findUnique({
      where: { codigo },
    });

    if (!prismaVaga) {
      return null;
    }

    return VagaMapper.toDomain(prismaVaga);
  }

  public async salvar(vaga: Vaga): Promise<Vaga> {
    const prismaVaga = await this.prisma.vaga.upsert({
      where: { id: vaga.id },

      create: VagaMapper.fromDomain(vaga),

      update: {
        codigo: vaga.codigo,
        tipo: vaga.tipo,
        disponivel: vaga.disponivel,
      },
    });

    return VagaMapper.toDomain(prismaVaga);
  }

  async listar(): Promise<Vaga[]> {
    const prismaVagas = await this.prisma.vaga.findMany();

    return prismaVagas.map((item) => VagaMapper.toDomain(item));
  }

  async deletar(id: string): Promise<void> {
    await this.prisma.vaga.delete({ where: { id } });
  }
}
