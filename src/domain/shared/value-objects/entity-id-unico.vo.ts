export class EntityIdUnico {
  private readonly valor: string;

  private static readonly UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  constructor(id?: string) {
    const resolvedId = id ?? crypto.randomUUID();

    if (!EntityIdUnico.UUID_REGEX.test(resolvedId)) {
      throw new Error(`Este ID não é válido`);
    }

    this.valor = resolvedId;
  }

  toString(): string {
    return this.valor;
  }

  equals(other: EntityIdUnico): boolean {
    return this.valor === other.valor;
  }
}
