-- CreateEnum
CREATE TYPE "TipoVaga" AS ENUM ('PADRAO', 'CADEIRANTE', 'IDOSO', 'MANUTENCAO');

-- CreateTable
CREATE TABLE "vagas" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "tipo" "TipoVaga" NOT NULL DEFAULT 'PADRAO',
    "disponivel" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "vagas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vagas_codigo_key" ON "vagas"("codigo");
