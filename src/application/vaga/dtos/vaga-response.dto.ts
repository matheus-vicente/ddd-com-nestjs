export class VagaResponseDTO {
  constructor(
    readonly id: string,
    readonly codigo: string,
    readonly tipo: string,
    readonly disponivel: boolean,
  ) {}
}
