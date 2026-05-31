<div align="center">

# ⚙️ Backend — Pelos Olhos de Rha

**API REST com Node.js, Express e Prisma**

API backend do blog Pelos Olhos de Rha. Responsável por gerenciar posts, tags, comentários, uploads de imagens, autenticação e estatísticas do dashboard administrativo.

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.1-000000?style=for-the-badge&logo=express)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql)](https://neon.tech)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)](https://docker.com)

</div>

---

## 📋 Índice

- [Sobre](#-sobre)
- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [API Endpoints](#-api-endpoints)
- [Autenticação](#-autenticação)
- [Modelos de Dados](#-modelos-de-dados)
- [Upload de Imagens](#-upload-de-imagens)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Docker](#-docker)
- [Banco de Dados](#-banco-de-dados)

---

## 🌟 Sobre

O backend é uma API RESTful que serve como núcleo do blog **Pelos Olhos de Rha**. Ele gerencia:

- 📝 CRUD completo de posts com rich-text
- 🏷️ Sistema de tags coloridas com relação N:N
- 📸 Galeria de fotos por post
- 💬 Comentários públicos
- 🔐 Autenticação JWT para área administrativa
- 📊 Estatísticas e métricas do blog
- 📤 Upload de imagens com validação
- 📷 Proxy para Instagram Feed API

---

## 🏛️ Arquitetura

```
src/
├── index.ts              # Entry point — Express app setup
├── seed.ts               # Seed do banco (usuário admin)
├── config/
│   ├── database.ts       # Prisma Client instance
│   └── env.ts            # Environment configuration
├── middleware/
│   └── auth.middleware.ts # JWT authentication guard
└── routes/
    ├── auth.routes.ts     # POST /login, GET /me
    ├── post.routes.ts     # CRUD de posts
    ├── comment.routes.ts  # Comentários (público + admin)
    ├── tag.routes.ts      # CRUD de tags
    ├── upload.routes.ts   # Upload de imagens (single + multiple)
    └── stats.routes.ts    # Dashboard statistics
```

### Fluxo de Requisição

```
Client → Express → CORS → JSON Parser → Route → [Auth Middleware] → Handler → Prisma → PostgreSQL
```

---

## 💻 Tecnologias

| Pacote | Função | Versão |
|--------|--------|--------|
| `express` | Framework HTTP | 5.1 |
| `@prisma/client` | ORM / Database | 6.0 |
| `@neondatabase/serverless` | Driver PostgreSQL serverless | 0.10 |
| `@prisma/adapter-neon` | Adapter Prisma p/ Neon | 6.0 |
| `jsonwebtoken` | Geração e validação JWT | 9.0 |
| `bcryptjs` | Hash de senhas | 2.4 |
| `multer` | Upload de arquivos | 1.4 |
| `cors` | Cross-Origin Resource Sharing | 2.8 |
| `dotenv` | Variáveis de ambiente | 16.4 |
| `uuid` | Geração de UUIDs | 10.0 |
| `esbuild` | Bundler para build | 0.24 |
| `tsx` | Executor TypeScript (dev) | 4.19 |

---

## 📌 Pré-requisitos

- [Node.js 20+](https://nodejs.org/)
- npm 10+
- Conta no [Neon](https://neon.tech) (PostgreSQL) ou PostgreSQL local

---

## 🔧 Instalação

```bash
# Entrar no diretório
cd backend

# Instalar dependências
npm install

# Criar arquivo .env
cp .env.example .env
# Edite com suas credenciais

# Gerar Prisma Client
npm run db:generate

# Executar migrações
npm run db:migrate:dev

# (Opcional) Criar usuário admin
npm run db:seed
```

---

## 📜 Scripts Disponíveis

| Script | Comando | Descrição |
|--------|---------|-----------|
| `dev` | `npm run dev` | Servidor com hot-reload (tsx watch) |
| `build` | `npm run build` | Build de produção (esbuild → `dist/`) |
| `start` | `npm start` | Executar build de produção |
| `db:generate` | `npm run db:generate` | Gerar Prisma Client |
| `db:migrate:dev` | `npm run db:migrate:dev` | Criar/aplicar migrações (dev) |
| `db:migrate:homolog` | `npm run db:migrate:homolog` | Aplicar migrações (homolog) |
| `db:migrate:prod` | `npm run db:migrate:prod` | Aplicar migrações (produção) |
| `db:seed` | `npm run db:seed` | Popular banco com admin padrão |

---

## 📡 API Endpoints

### Autenticação — `/api/auth`

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/auth/login` | Login (retorna JWT) | ❌ |
| GET | `/api/auth/me` | Dados do usuário logado | ✅ |

**Exemplo de login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@pelosolhosderha.com.br", "password": "admin123"}'
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "name": "Rha",
    "email": "admin@pelosolhosderha.com.br",
    "role": "admin"
  }
}
```

---

### Posts — `/api/posts`

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/posts` | Listar posts publicados (paginado) | ❌ |
| GET | `/api/posts/:id` | Buscar post por ID (com comentários e fotos) | ❌ |
| GET | `/api/posts/admin/all` | Listar todos os posts (inclui rascunhos) | ✅ |
| POST | `/api/posts` | Criar post | ✅ |
| PUT | `/api/posts/:id` | Atualizar post | ✅ |
| DELETE | `/api/posts/:id` | Deletar post | ✅ |

**Query params (GET /api/posts):**
- `page` — Número da página (default: 1)
- `limit` — Posts por página (default: 10)
- `tag` — Filtrar por nome da tag

**Body para criar/atualizar post:**
```json
{
  "title": "Título do Post",
  "content": "<p>Conteúdo HTML</p>",
  "excerpt": "Resumo breve",
  "coverImage": "/uploads/imagem.jpg",
  "published": true,
  "tags": ["viagem", "fotografia"],
  "photos": [
    { "url": "/uploads/foto1.jpg", "caption": "Legenda" },
    { "url": "/uploads/foto2.jpg" }
  ]
}
```

---

### Tags — `/api/tags`

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/tags` | Listar todas as tags (com contagem de posts) | ❌ |
| POST | `/api/tags` | Criar tag | ✅ |
| PUT | `/api/tags/:id` | Atualizar tag | ✅ |
| DELETE | `/api/tags/:id` | Deletar tag | ✅ |

**Body:**
```json
{
  "name": "fotografia",
  "color": "#6366f1"
}
```

---

### Comentários — `/api/comments`

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/comments/:postId` | Listar comentários de um post | ❌ |
| POST | `/api/comments/:postId` | Criar comentário em um post | ❌ |
| DELETE | `/api/comments/:id` | Deletar comentário | ✅ |

**Body para criar comentário:**
```json
{
  "name": "João",
  "text": "Adorei o post!",
  "avatar": "https://..."
}
```

---

### Upload — `/api/upload`

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/upload` | Upload de imagem única | ✅ |
| POST | `/api/upload/multiple` | Upload de múltiplas imagens (max 20) | ✅ |

**Formato:** `multipart/form-data`
- Campo `image` (single) ou `images` (multiple)
- Tipos aceitos: JPEG, JPG, PNG, GIF, WebP
- Tamanho máximo: 10 MB por arquivo

**Resposta (single):**
```json
{
  "url": "/uploads/abc123.jpg",
  "filename": "abc123.jpg"
}
```

---

### Estatísticas — `/api/stats`

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/stats` | Métricas do dashboard | ✅ |

**Resposta:**
```json
{
  "totalPosts": 15,
  "publishedPosts": 12,
  "draftPosts": 3,
  "totalComments": 48,
  "totalTags": 8,
  "recentComments": [...],
  "recentPosts": [...]
}
```

---

### Instagram — `/api/instagram`

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/instagram/feed?limit=9` | Feed do Instagram (proxy) | ❌ |

---

## 🔐 Autenticação

O sistema utiliza **JWT (JSON Web Tokens)** com validade de **7 dias**.

### Fluxo

1. Cliente envia `POST /api/auth/login` com email + senha
2. Servidor valida credenciais com BCrypt
3. Se válido, retorna token JWT assinado
4. Cliente envia token em todas as requisições protegidas:
   ```
   Authorization: Bearer <token>
   ```
5. Middleware `authMiddleware` valida o token e injeta `userId` na request

### Usuário padrão (seed)

| Email | Senha | Role |
|-------|-------|------|
| `admin@pelosolhosderha.com.br` | `admin123` | admin |
| `rhakramer@gmail.com` | `admin123` | admin |

> ⚠️ **Troque as senhas em produção!**

---

## 📐 Modelos de Dados

### Diagrama de Relações

```
User ─────┐
           │ 1:N
           ▼
         Post ◄───── PostTag ─────► Tag
           │            (N:N)
           │ 1:N
           ├──────► Photo
           │
           │ 1:N
           └──────► Comment ◄─── User (opcional)
```

### User

| Campo | Tipo | Restrição |
|-------|------|-----------|
| id | UUID | PK |
| email | String | Unique |
| password | String | BCrypt hash |
| name | String | — |
| role | String | Default: "admin" |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

### Post

| Campo | Tipo | Restrição |
|-------|------|-----------|
| id | UUID | PK |
| title | String | — |
| content | String | HTML (rich-text) |
| excerpt | String | — |
| coverImage | String? | URL |
| published | Boolean | Default: false |
| authorId | UUID | FK → User |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

### Tag

| Campo | Tipo | Restrição |
|-------|------|-----------|
| id | UUID | PK |
| name | String | Unique |
| color | String | Default: "#6366f1" |

### Photo

| Campo | Tipo | Restrição |
|-------|------|-----------|
| id | UUID | PK |
| url | String | — |
| caption | String? | — |
| order | Int | Default: 0 |
| postId | UUID | FK → Post (cascade delete) |

### Comment

| Campo | Tipo | Restrição |
|-------|------|-----------|
| id | UUID | PK |
| text | String | — |
| name | String | — |
| avatar | String? | — |
| postId | UUID | FK → Post (cascade delete) |
| userId | UUID? | FK → User (opcional) |
| createdAt | DateTime | Auto |

---

## 📤 Upload de Imagens

- **Armazenamento:** Sistema de arquivos local (`./uploads/`)
- **Nomes:** UUIDs para evitar conflitos
- **Validação:** Apenas imagens (jpeg, jpg, png, gif, webp)
- **Limite:** 10 MB por arquivo
- **Servidos como:** Arquivos estáticos em `/uploads/*`

---

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do backend:

```env
# Ambiente
NODE_ENV=development

# Servidor
PORT=3000

# Banco de dados (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Autenticação
JWT_SECRET="sua-chave-secreta-com-minimo-32-caracteres"

# CORS
FRONTEND_URL="http://localhost:4200"

# Upload
UPLOAD_DIR="./uploads"

# Instagram (opcional)
INSTAGRAM_TOKEN="seu-token-aqui"
```

---

## 🐳 Docker

### Build

```bash
docker build -t pelosolhosderha-backend .
```

### Run

```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="sua-chave" \
  -e FRONTEND_URL="http://localhost:4200" \
  -v $(pwd)/uploads:/app/uploads \
  pelosolhosderha-backend
```

### Dockerfile (Multi-stage)

- **Stage 1 (builder):** Instala deps, gera Prisma, compila com esbuild
- **Stage 2 (runner):** Imagem mínima Alpine com apenas o necessário
- **Resultado:** Imagem leve (~150 MB) e otimizada para produção

---

## 🗃️ Banco de Dados

### Provider

O projeto usa [Neon](https://neon.tech) — PostgreSQL serverless — via adapter Prisma.

### Migrações

```bash
# Criar nova migração
npm run db:migrate:dev

# Aplicar em produção
DATABASE_URL="..." npx prisma migrate deploy

# Ver status
DATABASE_URL="..." npx prisma migrate status

# Resetar banco (⚠️ apaga dados)
DATABASE_URL="..." npx prisma migrate reset
```

### Prisma Studio (GUI)

```bash
npx prisma studio
```

Abre interface visual em `http://localhost:5555` para explorar e editar dados.

---

<div align="center">

**Pelos Olhos de Rha** — Backend API

Desenvolvido por [Rhayssa Kramer](https://github.com/rhayssakramer)

</div>
