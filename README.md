# Backend Developer — Node.js

## Como Rodar o Projeto (Passo a Passo)

Este repositório é um monorepo contendo `backend` e `frontend`. Siga os passos abaixo para rodar a aplicação completa.

### 1. Raiz (Husky)

1. Rodar ```pnpm i``` na pasta raiz do repositório 

### 2. Backend e Serviços (Docker)

O backend utiliza Docker para subir a API, Banco de Dados (Postgres), Redis e Workers.

1. Acesse a pasta do backend:
   ```bash
   cd backend
   ```

2. Suba os containers:
   ```bash
   docker compose -f docker-compose.dev.yml up --build
   ```

   O Compose vai:
   - Subir um container Postgres 16 (porta `5432`)
   - Subir um container Redis (porta `6379`)
   - Rodar `prisma migrate deploy` (migrations automáticas)
   - Iniciar o Fastify em `http://localhost:8080`

### 3. Frontend (Vue.js)

O frontend é uma aplicação Vue.js que consome a API do backend.

1. Em um novo terminal, acesse a pasta do frontend (partindo da raiz do projeto):
   ```bash
   cd frontend
   ```

2. Instale as dependências:
   ```bash
   pnpm install
   # ou npm install
   ```

3. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```

4. Rode a aplicação:
   ```bash
   pnpm dev
   ```

5. Acesse no navegador:
   - Geralmente em `http://localhost:5173` (verifique o output do terminal).

---

### Comandos Úteis (Docker)

- **Derrubar os containers:**
  ```bash
  # dentro da pasta backend
  docker compose -f docker-compose.dev.yml down
  ```

- **Limpar tudo (incluindo dados do banco):**
  ```bash
  # dentro da pasta backend
  docker compose -f docker-compose.dev.yml down -v
  ```

---

Desenvolver uma aplicação backend completa com **autenticação**, **CRUD de produtos** e **boas práticas de arquitetura**, utilizando **Fastify ou NestJS** (um dos dois é obrigatório; dominar ambos é um diferencial).

O objetivo é avaliar sua capacidade de:
- Criar APIs robustas, escaláveis e seguras  
- Trabalhar com modelos de dados, filas, caches e storage  
- Escrever código bem estruturado  
- Aplicar boas práticas e organização arquitetural  

---

## Stack 

A aplicação deve utilizar:
- **Node.js**
- **Fastify ou NestJS**
- **PostgreSQL**
- **Prisma ORM**
- **BullMQ**
- **JWT para autenticação**

---

## Funcionalidades 

### 1) Autenticação
- Endpoint para **registro**  
- Endpoint para **login**  
- Geração de **JWT**  
- Middleware/Guard de proteção de rotas  

### 2) CRUD de Produtos

Cada produto deve conter:

- **Nome**
- **Imagem** (diferencial é fazer o armazenamento no Google Cloud Storage)
- **Categoria**
- **Descrição**

### 3) Fila

Criar uma fila que processe alguma tarefa após o cadastro do produto. Exemplos:
- Otimização da imagem  
- Geração de thumbnail  
- Mock de indexação em serviço de busca  
- Envio de notificação fake  

---

## Boas Práticas Avaliadas

- Organização de módulos e pastas  
- Tipagem correta  
- Validações
- Logs e tratamento de erros  
- Arquitetura limpa  
- Separação entre camadas (controller, service, repository)  

---

## Extras que aumentam MUITO sua pontuação

- Front-end em **Vue.js** consumindo a API  
- Microsserviços (separar API de workers, por exemplo)  
- Cache simples com Redis  
- Mensageria/eventos internos  
- Testes (uma funcionalidade é o suficiente)  
- Dockerfile + docker-compose  
- Husky + lint-staged + ESLint + Prettier  

---

## 📦 Entrega

Você deve disponibilizar:

### 1. **URL da aplicação rodando**  
Railway, Render, GCP, etc.

### 2. **Credenciais de acesso**  
Para testarmos o login e endpoints protegidos.

### 3. **Repositório** com o código:

- Instruções de setup  
- Como rodar migrations  
- Como configurar variáveis de ambiente  
- Como subir workers e filas  
- Como executar testes (se houver)

### 4. **Envio**
- Enviar os itens acima e as instruções para wallace.erick@orbital.company

---

## O que buscamos 

- Arquitetura escalável  
- Familiaridade com filas, caches e storage  
- Código limpo e documentado  
- Visão de produto e de engenharia  
- Proatividade e boa comunicação  
- Capricho final  
