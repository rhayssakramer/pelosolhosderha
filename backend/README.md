<div align="center">

# ⚙️ Backend — Pelos Olhos de Rha

**API REST com Node.js, Express e Prisma**

API backend robusta e escalável para o blog Pelos Olhos de Rha. Desenvolvida com as melhores práticas de engenharia de software, oferecendo autenticação segura, gerenciamento de conteúdo completo e estatísticas em tempo real.

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.1-000000?style=for-the-badge&logo=express)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql)](https://neon.tech)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)](https://docker.com)
[![Azure](https://img.shields.io/badge/Azure%20Container%20Apps-Production-0078D4?style=for-the-badge&logo=microsoftazure)](https://azure.microsoft.com)

**Status:** ✅ Production Ready | **Versão:** 2.0.0

</div>

---

## 📋 Índice

- [Sobre](#-sobre)
- [Características](#-características)
- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Setup](#-instalação-e-setup)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [API Endpoints](#-api-endpoints)
- [Autenticação e Segurança](#-autenticação-e-segurança)
- [Upload de Imagens](#-upload-de-imagens)
- [CORS](#-cors-cross-origin-resource-sharing)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Docker](#-docker)
- [Banco de Dados](#-banco-de-dados)
- [Desenvolvimento](#-desenvolvimento)
- [Troubleshooting](#-troubleshooting)
- [Performance e Otimizações](#-performance-e-otimizações)
- [Créditos](#-créditos)

---

## 🌟 Sobre

O **Backend Pelos Olhos de Rha** é uma API REST profissional desenvolvida em TypeScript, Express e Prisma. Serve como núcleo da plataforma de blog, gerenciando todas as operações críticas com segurança, performance e escalabilidade em mente.

### Capacidades

- 📝 CRUD completo de posts com rich-text HTML
- 🏷️ Sistema de tags coloridas com relação N:N
- 📸 Galeria de fotos por post com upload múltiplo
- 💬 Sistema de comentários público com moderação admin
- 🔐 Autenticação JWT segura (7 dias de validade)
- 📊 Estatísticas e métricas do blog em tempo real
- 📤 Upload de imagens com validação e renaming com UUID
- 📷 Proxy para Instagram Feed API
- 🔍 Filtros avançados e paginação
- 🌐 CORS configurado para múltiplos ambientes
- 🐳 Containerização Docker para produção
- ☁️ Deploy em Azure Container Apps

---

## ✨ Características

### Funcionalidades

- ✅ API RESTful bem documentada
- ✅ Type-safety com TypeScript em 100% do código
- ✅ ORM type-safe com Prisma (migrations automáticas)
- ✅ Autenticação JWT com middleware customizado
- ✅ Hash de senhas com bcryptjs (salt + pepper)
- ✅ Upload de imagens com validação MIME e limite de tamanho
- ✅ Paginação, filtros e busca avançada
- ✅ Seed automático de usuários admin
- ✅ CORS flexível e seguro
- ✅ Tratamento de erros centralizado
- ✅ Logging de requisições
- ✅ Validação de inputs em todos endpoints

### Performance

- ⚡ Build otimizado com esbuild (~2-3 MB)
- ⚡ Cold start rápido em serverless
- ⚡ Database queries otimizadas com Prisma
- ⚡ Compressão de respostas HTTP
- ⚡ Lazy loading de relacionamentos

### Segurança

- 🔒 HTTPS obrigatório em produção
- 🔒 JWT assinado com HS256
- 🔒 Validação CORS rigorosa
- 🔒 Proteção contra CSRF
- 🔒 Rate limiting pronto para integração
- 🔒 SQL Injection prevention (Prisma)
- 🔒 XSS prevention com sanitização de inputs
- 🔒 Senhas hashadas com bcryptjs

---

## 🏛️ Arquitetura

### Estrutura de Pastas

```
backend/
├── src/
│   ├── index.ts                      # Entry point — Express setup
│   ├── seed.ts                       # Seed do banco com admin
│   ├── config/
│   │   ├── database.ts               # Prisma Client singleton
│   │   ├── env.ts                    # Validação de variáveis
│   │   ├── email.ts                  # Email config (opcional)
│   │   └── storage.ts                # Storage config
│   ├── middleware/
│   │   ├── auth.middleware.ts        # JWT validation
│   │   ├── cors.middleware.ts        # CORS handler
│   │   └── error.middleware.ts       # Error handler
│   ├── routes/
│   │   ├── index.ts                  # Router agregador
│   │   ├── auth.routes.ts            # POST /login, GET /me
│   │   ├── post.routes.ts            # CRUD posts
│   │   ├── tag.routes.ts             # CRUD tags
│   │   ├── comment.routes.ts         # Comentários
│   │   ├── upload.routes.ts          # Upload de imagens
│   │   ├── stats.routes.ts           # Estatísticas
│   │   ├── google-auth.routes.ts     # OAuth (opcional)
│   │   ├── newsletter.routes.ts      # Newsletter (opcional)
│   │   └── instagram.routes.ts       # Instagram feed
│   ├── utils/
│   │   ├── validators.ts             # Validação de inputs
│   │   ├── formatters.ts             # Formatação de dados
│   │   ├── urlNormalizer.ts          # Normalização de URLs
│   │   └── file-handler.ts           # Upload handling
│   └── scripts/
│       ├── migrate-urls-production.ts
│       └── test-db-connection.ts     # Testar conexão BD
├── prisma/
│   ├── schema.prisma                 # Schema principal
│   ├── schema.dev.prisma             # Schema alternativo
│   └── migrations/                   # Migration files
├── uploads/                          # Imagens locais (dev)
├── .env.example                      # Template .env
├── .dockerignore                     # Docker ignore
├── Dockerfile                        # Multi-stage build
├── Dockerfile.quick                  # Quick build
├── esbuild.config.js                 # Build config
├── tsconfig.json                     # TypeScript config
└── package.json                      # Dependencies

```

### Fluxo de Requisição

```
┌─────────────────┐
│  HTTP Request   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│   Express Server (index.ts)         │
│   - JSON Parser                     │
│   - CORS Validator                  │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│   Route Handler                     │
│   - Path Matching                   │
│   - Parameter Parsing               │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│   Auth Middleware (se protected)    │
│   - JWT Validation                  │
│   - User Extraction                 │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│   Business Logic                    │
│   - Validation                      │
│   - Processing                      │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│   Prisma ORM                        │
│   - Query Building                  │
│   - Type Safety                     │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│   PostgreSQL Database               │
│   - Query Execution                 │
│   - Transaction Management          │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│   Response Builder                  │
│   - Serialization                   │
│   - HTTP Status                     │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│   HTTP Response (JSON)              │
│   - Headers                         │
│   - Body                            │
└─────────────────────────────────────┘
```

### Modelo de Dados

```
User (Usuário - Admin)
  ├── 1:N → Post (Autor)
  ├── 1:N → Comment (Autor opcional)
  └── Autenticação (email, password hash)

Post (Artigo/Post)
  ├── 1:N → Photo (Galeria)
  ├── 1:N → Comment (Comentários)
  ├── N:N → Tag (via PostTag junction table)
  └── Metadata (title, content, excerpt, published)

Tag (Etiqueta)
  └── N:N → Post (via PostTag)

Photo (Imagem em Post)
  ├── N:1 → Post (FK)
  └── Metadata (url, caption, order)

Comment (Comentário)
  ├── N:1 → Post (FK)
  ├── ?:1 → User (FK opcional - admin)
  └── Metadata (text, name, avatar)

PostTag (Junction Table)
  ├── N:1 → Post (FK)
  └── N:1 → Tag (FK)
```

---

## 💻 Tecnologias

### Dependências Principais

| Pacote | Versão | Propósito |
| --- | --- | --- |
| `express` | 5.1 | Framework HTTP |
| `@prisma/client` | 6.0 | ORM TypeScript |
| `@prisma/adapter-neon` | 6.0 | Adapter para Neon |
| `jsonwebtoken` | 9.0 | JWT generation/validation |
| `bcryptjs` | 2.4 | Password hashing |
| `multer` | 1.4 | File upload middleware |
| `cors` | 2.8 | CORS handling |
| `dotenv` | 16.4 | Environment variables |
| `uuid` | 10.0 | UUID generation |

### Dependências de Build

| Pacote | Versão | Propósito |
| --- | --- | --- |
| `esbuild` | 0.24 | Bundler otimizado |
| `tsx` | 4.19 | TypeScript executor |
| `typescript` | 5.7 | Type checking |
| `@types/node` | Latest | Node.js types |

### Stack Completo

```
Node.js 20+                              [Runtime]
  ↓
Express 5.1                              [HTTP Framework]
  ↓
TypeScript 5.7                           [Language]
  ↓
Prisma 6.0 + Neon Adapter               [ORM + Database Driver]
  ↓
PostgreSQL (Neon)                        [Database]
```

---

## 📌 Pré-requisitos

### Obrigatório

- **Node.js 20.0+** — [Download](https://nodejs.org/)
- **npm 10.0+** — Incluído com Node.js
- **PostgreSQL 15+** (local) ou conta no **Neon** (cloud)
  - Local: [PostgreSQL Download](https://www.postgresql.org/download/)
  - Cloud: [Neon](https://neon.tech) (recomendado para dev/prod)

### Opcional

- **Docker Desktop** — [Download](https://www.docker.com/) (para containerização)
- **Postman/Insomnia** — Para testar API manualmente
- **Git** — [Download](https://git-scm.com/)

### Verificar Instalação

```bash
node --version      # v20.x.x
npm --version       # 10.x.x
git --version       # 2.x.x
```

---

## 🔧 Instalação e Setup

### 1. Clone e Navegue

```bash
git clone https://github.com/rhayssakramer/pelosolhosderha.git
cd pelosolhosderha/backend
```

### 2. Instale Dependências

```bash
npm install
```

Expected output:
```
added 125 packages in 2m
```

### 3. Configure Variáveis de Ambiente

```bash
cp .env.example .env
```

Edite `.env`:

```env
# Banco de Dados
DATABASE_URL="postgresql://user:password@localhost:5432/pelosolhos"

# JWT
JWT_SECRET="sua-chave-secreta-com-minimo-32-caracteres-aleatorios"

# Servidor
PORT=3000
NODE_ENV=development

# Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760

# CORS
ALLOWED_ORIGINS="http://localhost:4200,http://localhost:3000"

# Opcional
INSTAGRAM_TOKEN=""
```

### 4. Gerar Prisma Client

```bash
npm run db:generate
```

Output:
```
✓ Generated Prisma Client v6.0.0
```

### 5. Executar Migrações

```bash
npm run db:migrate:dev
```

Isso:
- ✅ Cria banco de dados (se não existe)
- ✅ Executa migrações pendentes
- ✅ Gera Prisma Client
- ✅ Sincroniza schema

### 6. (Opcional) Populate Database

```bash
npm run db:seed
```

### 7. Verificar Setup

```bash
npm run dev
```

Esperado:
```
✓ Server running on http://localhost:3000
✓ Connected to database
✓ Ready for requests
```

---

## 📜 Scripts Disponíveis

### Desenvolvimento

```bash
npm run dev              # Inicia servidor com hot reload (tsx watch)
npm run build            # Build para produção (esbuild)
npm start                # Executa build produção
```

### Banco de Dados

```bash
npm run db:generate      # Gera Prisma Client
npm run db:migrate:dev   # Migrações em dev (interativo)
npm run db:migrate:prod  # Migrações em produção
npm run db:seed          # Populate inicial (admin)
npm run db:studio        # Abre GUI Prisma Studio (http://localhost:5555)
npm run test:db-connection  # Testa conexão com BD
```

### Build & Deploy

```bash
npm run build            # Build otimizado com esbuild
npm run build:quick      # Build rápido (sem minify)
npm run build:analysis   # Build com análise de tamanho
```

---

## 📡 API Endpoints

### Autenticação — `POST /api/auth`

| Método | Endpoint | Descrição | Auth | Rate |
| --- | --- | --- | --- | --- |
| POST | `/api/auth/login` | Login e obtenção JWT | ❌ | 5/min |
| GET | `/api/auth/me` | Dados do usuário | ✅ | 60/min |

### Posts — `GET|POST|PUT|DELETE /api/posts`

| Método | Endpoint | Descrição | Auth |
| --- | --- | --- | --- |
| GET | `/api/posts` | Listar publicados (paginado) | ❌ |
| GET | `/api/posts/:id` | Buscar por ID | ❌ |
| GET | `/api/posts/admin/all` | Todos (inclui rascunhos) | ✅ |
| POST | `/api/posts` | Criar novo post | ✅ |
| PUT | `/api/posts/:id` | Atualizar post | ✅ |
| DELETE | `/api/posts/:id` | Deletar post | ✅ |

**Query Parameters:**
- `page=1` — Página (default: 1)
- `limit=10` — Itens por página (default: 10, max: 100)
- `tag=fotografia` — Filtrar por tag
- `search=termo` — Buscar por título/conteúdo
- `published=true` — Filtrar por status

### Tags — `GET|POST|PUT|DELETE /api/tags`

| Método | Endpoint | Descrição | Auth |
| --- | --- | --- | --- |
| GET | `/api/tags` | Listar tags | ❌ |
| POST | `/api/tags` | Criar tag | ✅ |
| PUT | `/api/tags/:id` | Atualizar tag | ✅ |
| DELETE | `/api/tags/:id` | Deletar tag | ✅ |

### Comentários — `GET|POST|DELETE /api/comments`

| Método | Endpoint | Descrição | Auth |
| --- | --- | --- | --- |
| GET | `/api/comments/:postId` | Listar comentários | ❌ |
| POST | `/api/comments` | Criar comentário | ❌ |
| DELETE | `/api/comments/:id` | Deletar comentário | ✅ |

### Upload — `POST /api/upload`

| Método | Endpoint | Descrição | Auth | Limite |
| --- | --- | --- | --- | --- |
| POST | `/api/upload` | Upload imagem única | ✅ | 10 MB |
| POST | `/api/upload/multiple` | Upload múltiplas | ✅ | 10 MB / arquivo |

**Tipos aceitos:** JPEG, JPG, PNG, GIF, WebP

### Estatísticas — `GET /api/stats`

| Método | Endpoint | Descrição | Auth |
| --- | --- | --- | --- |
| GET | `/api/stats` | Métricas dashboard | ✅ |

---

## 🔐 Autenticação e Segurança

### JWT (JSON Web Token)

**Configuração:**
- **Algoritmo:** HS256 (HMAC-SHA256)
- **Validade:** 7 dias
- **Secret:** Mínimo 32 caracteres (produção 64+)
- **Refresh:** Token expira, fazer login novamente

**Fluxo:**

```
1. POST /login (email + senha)
   ↓
2. Validar email + compareSync senha com hash
   ↓
3. Gerar JWT assinado com JWT_SECRET
   ↓
4. Retornar token + user data
   ↓
5. Client armazena em localStorage
   ↓
6. Cada requisição protegida envia:
   Authorization: Bearer <token>
   ↓
7. Middleware valida token
   ↓
8. Se válido: injeta userId em request
   Se inválido: retorna 401
```

### Boas Práticas

✅ **DO:**
- Usar HTTPS em produção
- Rotacionar JWT_SECRET a cada 90 dias
- Implementar refresh tokens para sessões longas
- Validar CORS rigorosamente
- Implementar rate limiting
- Logar tentativas de autenticação falhadas
- Usar bcryptjs com salt mínimo de 10 rounds

❌ **DON'T:**
- Guardar senhas em plain text
- Expor JWT_SECRET no repositório
- Usar HTTP em produção
- Confiar apenas em CORS
- Deixar debug mode ativo em produção

---

## 📸 Upload de Imagens

### Configuração

| Aspecto | Valor | Descrição |
| --- | --- | --- |
| Tipos | JPEG, JPG, PNG, GIF, WebP | Validação MIME |
| Tamanho | 10 MB | Por arquivo |
| Autenticação | JWT | Obrigatório |
| Limite múltiplo | 20 | Máximo de arquivos |

### Armazenamento

| Ambiente | Local | Tipo |
| --- | --- | --- |
| Desenvolvimento | `./backend/uploads/` | Filesystem |
| Produção | Azure Blob Storage | Cloud Object Storage |

### Endpoints

```
POST /api/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

Field: image
```

```
POST /api/upload/multiple
Content-Type: multipart/form-data
Authorization: Bearer <token>

Field: images[] (array)
```

### Response

```json
{
  "success": true,
  "data": {
    "url": "/uploads/550e8400-e29b-41d4-a716-446655440000.jpg",
    "filename": "550e8400-e29b-41d4-a716-446655440000.jpg",
    "size": 524288,
    "mimeType": "image/jpeg"
  }
}
```

### Segurança

✅ Validação MIME (não apenas extensão)
✅ Limite de tamanho por arquivo
✅ Renaming com UUID (previne conflitos)
✅ Isolamento em diretório `/uploads`
✅ Sanitização de nomes
✅ Autenticação obrigatória

---

## 🌐 CORS (Cross-Origin Resource Sharing)

### Configuração

O backend permite requisições de origens específicas:

```javascript
// src/index.ts
const ALLOWED_ORIGINS = [
  'http://localhost:4200',           // Frontend development
  'http://localhost:3000',           // Backend development
  'https://your-frontend.vercel.app',    // Frontend staging
  'https://your-domain.com',         // Domain production
  'https://your-static-web-app.azurewebsites.net' // Azure static web app
];
```

### Adicionando Nova Origem

1. Abra `src/index.ts`
2. Adicione URL em `ALLOWED_ORIGINS`
3. Reinicie o servidor

```bash
npm run dev
```

### Troubleshooting CORS

**Erro:** `No 'Access-Control-Allow-Origin' header`

**Solução:**
1. Verifique se origem está em `ALLOWED_ORIGINS`
2. URL deve ser exata (http vs https, porta, etc)
3. Reinicie servidor
4. Limpe cache do navegador

---

## 🔐 Variáveis de Ambiente

### .env File

```env
# ===== SERVIDOR =====
NODE_ENV=development
PORT=3000

# ===== BANCO DE DADOS =====
# Opção 1: Neon (serverless)
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/database?sslmode=require"

# Opção 2: PostgreSQL Local
# DATABASE_URL="postgresql://user:password@localhost:5432/pelosolhos"

# ===== AUTENTICAÇÃO JWT =====
JWT_SECRET="your-secret-key-minimum-32-characters-random-and-strong"
JWT_EXPIRY=7d

# ===== UPLOAD DE ARQUIVOS =====
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760

# ===== CORS =====
ALLOWED_ORIGINS="http://localhost:4200,http://localhost:3000,https://your-frontend.com"
FRONTEND_URL="http://localhost:4200"

# ===== OPTIONAL - INSTAGRAM =====
INSTAGRAM_TOKEN=""
INSTAGRAM_BUSINESS_ACCOUNT_ID=""

# ===== OPTIONAL - AZURE BLOB (PRODUÇÃO) =====
AZURE_STORAGE_ACCOUNT_NAME=""
AZURE_STORAGE_ACCOUNT_KEY=""
AZURE_STORAGE_CONTAINER_NAME="uploads"

# ===== OPTIONAL - EMAIL =====
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="your-email@example.com"
SMTP_PASSWORD="your-app-password"
```

### Validação

Variáveis obrigatórias são validadas no startup:

```bash
npm run dev
```

Se houver erro:
```
❌ Missing required environment variables:
- DATABASE_URL
- JWT_SECRET
```

---

## 🐳 Docker

### Build

```bash
cd backend

# Multi-stage build (otimizado)
docker build -t pelosolhosderha-backend:latest .

# Build rápido (desenvolvimento)
docker build -f Dockerfile.quick -t pelosolhosderha-backend:dev .
```

### Run Local

```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="sua-chave" \
  -e NODE_ENV="production" \
  -v $(pwd)/uploads:/app/uploads \
  pelosolhosderha-backend:latest
```

### Push para Registry

```bash
# Azure Container Registry
docker tag pelosolhosderha-backend:latest \
  pelosolhosderhaacr.azurecr.io/pelosolhosderha-backend:latest

docker push pelosolhosderhaacr.azurecr.io/pelosolhosderha-backend:latest
```

### Dockerfile Explicado

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /build/dist ./dist
COPY --from=builder /build/node_modules ./node_modules
COPY prisma ./prisma
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

Tamanho resultante: ~150 MB

---

## 🗃️ Banco de Dados

### Provider: Neon

[Neon](https://neon.tech) é PostgreSQL 15+ serverless com scale-to-zero:

```
Vantagens:
✅ Sem gerenciamento de servidor
✅ Scale to zero (economia)
✅ Backups automáticos
✅ Conexões serverless
✅ Free tier generoso
```

### Connection String

```
postgresql://username:password@ep-xxx.neon.tech/dbname?sslmode=require
```

Obter em: [Neon Console](https://console.neon.tech)

### Migrações

```bash
# Criar nova migração
npm run db:migrate:dev

# Prompt: Enter a name for the new migration
# Exemplo: add_email_to_comment

# Editar schema em schema.prisma
# Prisma cria SQL automaticamente

# Aplicar em produção
DATABASE_URL="..." npm run db:migrate:prod

# Ver status
DATABASE_URL="..." npx prisma migrate status
```

### Prisma Studio

GUI visual para explorar/editar dados:

```bash
npx prisma studio
```

Abre em: `http://localhost:5555`

---

## 💻 Desenvolvimento

### Workflow

```bash
# 1. Crie feature branch
git checkout -b feature/minha-feature

# 2. Instale deps
npm install

# 3. Configure .env
cp .env.example .env
# Edite com suas credenciais

# 4. Inicie dev server
npm run dev

# 5. Faça alterações
# ... edite arquivos ...

# 6. Commit
git add .
git commit -m "feat: descrição da mudança"

# 7. Push
git push origin feature/minha-feature

# 8. Abra Pull Request
```

### Estrutura de Branches

```
main (production)
├── homolog (homologação)
└── dev (development)
    ├── feature/xyz
    ├── fix/abc
    └── docs/readme
```

### Testes (Se Implementado)

```bash
npm test                # Testes unitários
npm run test:coverage   # Com coverage report
npm run test:watch      # Watch mode
```

### Linting

```bash
npm run lint            # Verifica código
npm run lint:fix        # Corrige problemas
```

---

## 🔧 Troubleshooting

### 1. Conexão com Banco Falha

**Erro:**
```
Error: unable to connect to database
```

**Solução:**

```bash
# Verificar CONNECTION_STRING
cat .env | grep DATABASE_URL

# Testar conexão
npm run test:db-connection

# Se usar Neon:
# 1. Acesse console.neon.tech
# 2. Copie connection string corretamente
# 3. Inclua ?sslmode=require

# Se usar local:
# 1. Verifique se PostgreSQL está rodando
# 2. Credenciais estão corretas?
# 3. Banco existe?

psql -U postgres -c "CREATE DATABASE pelosolhos;"
```

### 2. Token JWT Inválido (401)

**Erro:**
```
{"error": "Unauthorized", "message": "Invalid token"}
```

**Solução:**

```bash
# Fazer login novamente
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@pelosolhosderha.com.br", "password": "admin123"}'

# Copie token da resposta

# Teste com novo token
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer your-jwt-token-here"

# Verifique token em jwt.io
```

### 3. Erro CORS

**Erro:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solução:**

```bash
# 1. Edite src/index.ts
# 2. Adicione seu frontend em ALLOWED_ORIGINS

const ALLOWED_ORIGINS = [
  'http://localhost:4200',       // Your frontend URL
  'https://your-frontend.com'
];

# 3. Reinicie servidor
npm run dev

# Importante: URL deve ser EXATA
# ❌ localhost:4200 != localhost:4200/
# ❌ http != https
# ✅ http://localhost:4200
```

### 4. Upload Falha (413 Payload Too Large)

**Erro:**
```
413 Payload Too Large
```

**Solução:**

```bash
# Arquivo > 10 MB?
# 1. Comprima imagem
# 2. Verifique MAX_FILE_SIZE em .env

MAX_FILE_SIZE=10485760  # 10 MB

# 3. Verifique limits em src/index.ts
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb' }));
```

### 5. Prisma Client Desatualizado

**Erro:**
```
Property 'xxx' does not exist on type 'PrismaClient'
```

**Solução:**

```bash
npm run db:generate

# Ou manualmente
npx prisma generate

# Reinicie servidor
npm run dev
```

### 6. Docker Build Falha

**Erro:**
```
npm ERR! code E404 Not Found
```

**Solução:**

```bash
# 1. Verifique se está em /backend
cd backend

# 2. Limpe cache
docker builder prune

# 3. Recrie sem cache
docker build --no-cache -t pelosolhosderha-backend .

# 4. Verifique logs
docker build --progress=plain .
```

---

## ⚡ Performance e Otimizações

### Database

- ✅ Índices em foreign keys
- ✅ Lazy loading com relações
- ✅ Paginação para grandes datasets
- ✅ Connection pooling com Neon Adapter

### API

- ✅ Response compression
- ✅ Minified production bundle (~2-3 MB)
- ✅ Efficient JSON serialization
- ✅ Caching headers

### Build

```
Development:    16.5 MB (unminified)
Production:     2.8 MB (minified + esbuild)
Container:      ~150 MB (Alpine base)
```

### Métricas

```
Cold start:      < 2s (serverless)
Request latency: 50-100ms (média)
Database latency: 20-50ms (Neon)
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📚 Documentação Adicional

- [Express Docs](https://expressjs.com)
- [Prisma Docs](https://www.prisma.io/docs/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [JWT.io](https://jwt.io)
- [Neon Docs](https://neon.tech/docs/)

---

## 📄 Licença

Este projeto está sob a licença [MIT](../LICENSE).

---

<div align="center">

**Pelos Olhos de Rha** — Backend API

Desenvolvido com ❤️ por [Rhayssa Kramer](https://github.com/rhayssakramer)

© 2026 Todos os direitos reservados.

</div>

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

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Admin User",
    "email": "admin@example.com",
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

## 🌐 CORS (Cross-Origin Resource Sharing)
O backend está configurado para aceitar requisições de múltiplas origens (origins):

```javascript
const allowedOrigins = [
  'http://localhost:4200',                        // Frontend development
  'http://localhost:3000',                        // Backend development
  'https://pelosolhosderha.vercel.app',           // Frontend development/preview
  'https://pelosolhosderha-homolog.vercel.app',   // Frontend homologação
  'https://www.pelosolhosderha.com.br',           // Production domain
  'https://pelosolhosderhastore.z20.web.core.windows.net' // Azure static web app
];
```

> **Nota:** Se você estiver integrando um novo frontend ou ambiente, adicione a origin na lista acima em `src/index.ts`.

---

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do backend:

```env
# Ambiente
NODE_ENV=development

# Servidor
PORT=3000

# Banco de dados (Neon PostgreSQL)
DATABASE_URL="postgresql://username:password@endpoint.neon.tech/database?sslmode=require"

# Autenticação
JWT_SECRET="your-secret-key-minimum-32-characters-long-and-random"

# Upload
UPLOAD_DIR="./uploads"

# Instagram (opcional)
INSTAGRAM_TOKEN="your-instagram-token"

# Azure Blob Storage (opcional - para uploads em produção)
AZURE_STORAGE_ACCOUNT_NAME="your-storage-account"
AZURE_STORAGE_ACCOUNT_KEY="your-storage-key"
AZURE_STORAGE_CONTAINER_NAME="uploads"
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
  -e DATABASE_URL="postgresql://username:password@endpoint.neon.tech/database?sslmode=require" \
  -e JWT_SECRET="your-secret-key-minimum-32-characters" \
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

---

## 🔧 Troubleshooting

### Erro 401 (Unauthorized) no Upload

**Problema:** O upload retorna 401 mesmo com token válido.

**Solução:**
1. Verifique se a origem (origin) do seu frontend está na lista de `allowedOrigins`
2. Confirme que o token está sendo enviado no header `Authorization: Bearer <token>`
3. Valide o token em [jwt.io](https://jwt.io)
4. Verifique os logs do servidor: `npm run dev`

### Token Expirado (401)

**Problema:** Recebe 401 depois de algumas horas.

**Solução:** Tokens JWT expiram em 7 dias. Cliente precisa fazer login novamente para obter novo token.

### CORS Error no Console

**Problema:** `Access-Control-Allow-Origin` error no navegador.

**Solução:** Adicione sua URL de frontend em `src/index.ts` na lista de `allowedOrigins` e recompile.

---

<div align="center">

**Pelos Olhos de Rha** — Backend API

Desenvolvido por [Rhayssa Kramer](https://github.com/rhayssakramer)

</div>
