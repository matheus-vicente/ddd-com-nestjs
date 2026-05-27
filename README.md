# Nest Park API

Javagas é uma api REST de gerenciamento de estacionamento, a nível de estudo, construído utilizando os conceitos de DDD (Domain-Driven Design), focado em desacoplar a regra de negócio da infraestrutura.

## 🛠️ Tecnologias Utilizadas

- **Framework**: [NestJS](https://nestjs.com/) (v11)
- **Linguagem**: TypeScript
- **Banco de Dados**: PostgreSQL
- **ORM**: [Prisma](https://www.prisma.io/)
- **Testes**: [Vitest](https://vitest.dev/)
- **Conteinerização**: Docker & Docker Compose
- **Formatação e Linting**: ESLint & Prettier

## 🏗️ Arquitetura

O projeto foi estruturado utilizando conceitos de **Domain-Driven Design (DDD)**, separado pelas seguintes camadas:

- **`domain/`**: Núcleo da aplicação. Contém as Entidades (`Vaga`, `Ticket`), Enums (`TipoVaga`, `StatusTicket`, `TipoTarifa`), Repositórios (interfaces) e Value Objects.
- **`application/`**: Casos de uso da aplicação e DTOs, orquestrando as operações entre o domínio e a infraestrutura.
- **`infra/`**: Implementações concretas de acesso a dados e framework (Persistência com Prisma, filtros de exceção, módulos HTTP).
- **`presentation/`**: Ponto de entrada da API (Controllers, rotas REST).

## 🚀 Como executar o projeto

### Instalação

1. Clone o repositório e acesse a pasta do projeto:

```bash
  git clone https://github.com/matheus-vicente/ddd-com-nestjs.git
  cd nest-park
```

2. Instale as dependências:

```bash
  npm install
```

3. Configure as variáveis de ambiente:
   Crie um arquivo `.env` na raiz do projeto, baseado nas configurações de banco de dados do `docker-compose.yml`:

```env
  DATABASE_URL="postgresql://admin:postgres@localhost:5432/nest_park?schema=public"
```

### Subindo o Banco de Dados

Inicie o banco de dados PostgreSQL utilizando o Docker Compose:

```bash
  docker-compose up -d
```

### Executando as Migrations do Prisma

Aplique as migrações para criar as tabelas no banco de dados:

```bash
  npx prisma migrate dev
```

### Iniciando a Aplicação

```bash
  npm run start:dev
```

## 🧪 Testes

O projeto utiliza Vitest para testes automatizados.

```bash
  npm run test
```

## 🔗 Endpoints da API

### 🅿️ Vagas

- **`GET /v1/vagas`**: Retorna uma lista de todas as vagas do estacionamento.
- **`POST /v1/vagas`**: Cria uma nova vaga no sistema.
- **`PUT /v1/vagas/:id`**: Atualiza as informações de uma vaga específica.
- **`DELETE /v1/vagas/:id`**: Remove uma vaga do sistema pelo seu ID.

### 🎟️ Tickets

- **`POST /v1/vagas/:vagaId/gerar-ticket`**: Gera um novo ticket associado a uma vaga específica.
- **`PUT /v1/tickets/:id/fechar`**: Finaliza um ticket pelo seu ID (marca como pago/fechado e calcula o valor, se aplicável).
- **`PUT /v1/tickets/:id/cancelar`**: Cancela um ticket pelo seu ID.
