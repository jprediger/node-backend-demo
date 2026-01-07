# Backend Developer — Node.js

## Setup do Ambiente de Desenvolvimento (Docker)

**Pré-requisitos:** Docker + Docker Compose instalados.

### Subir tudo (Postgres + Backend)

```bash
docker compose -f docker-compose.dev.yml up --build
```

O Compose vai:
1. Subir um container Postgres 16 (porta `5432`)
2. Aguardar o banco ficar pronto (healthcheck)
3. Rodar `prisma migrate deploy` (migrations automáticas)
4. Iniciar o Fastify em `http://localhost:8080`

### Derrubar os containers

```bash
docker compose -f docker-compose.dev.yml down
```

### Limpar completamente (incluindo volumes do banco)

```bash
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
