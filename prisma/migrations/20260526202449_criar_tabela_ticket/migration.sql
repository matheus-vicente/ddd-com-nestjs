-- CreateEnum
CREATE TYPE "StatusTicket" AS ENUM ('PENDENTE', 'PAGO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "TipoTarifa" AS ENUM ('DIARIA', 'MENSAL', 'PRIMEIRA_HORA_MAIS_HORA_ADICIONAL');

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "vagaId" TEXT NOT NULL,
    "status" "StatusTicket" NOT NULL DEFAULT 'PENDENTE',
    "placa" TEXT NOT NULL,
    "tipoTarifa" "TipoTarifa" NOT NULL DEFAULT 'DIARIA',
    "valorTarifa" INTEGER NOT NULL,
    "valorAdicionalTarifa" INTEGER NOT NULL,
    "valor" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL,
    "dataDeSaida" TIMESTAMP(3),

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tickets_codigo_key" ON "tickets"("codigo");

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_vagaId_fkey" FOREIGN KEY ("vagaId") REFERENCES "vagas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
