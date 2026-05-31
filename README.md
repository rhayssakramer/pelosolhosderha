# 👁️ Pelos Olhos de Rha

Blog pessoal desenvolvido com **Angular 20** (frontend) e **Express + Prisma** (backend), com deploy automatizado na **Vercel** (frontend) e **Azure Container Apps** (backend).

---

## 🌐 Links de Produção

| Serviço | URL |
|---------|-----|
| Frontend | https://pelosolhosderha.vercel.app |
| Backend API | https://pelosolhosderha-api.bluesea-ecfbf889.brazilsouth.azurecontainerapps.io |
| Banco de Dados | Neon PostgreSQL (us-east-1) |

---

## 🏗️ Arquitetura

```
┌──────────────┐     ┌────────────────────────┐     ┌─────────────┐
│   Vercel     │────▶│  Azure Container Apps  │────▶│  Neon DB    │
│  (Angular)   │     │  (Express + Prisma)    │     │ (PostgreSQL)│
└──────────────┘     └────────────────────────┘     └─────────────┘
     Frontend              Backend API                  Database
```

---

## 📁 Estrutura do Projeto

```
pelosolhosderha/
├── src/                    # Frontend Angular 20 (SSR)
│   ├── app/
│   │   ├── components/     # Páginas e componentes
│   │   │   ├── blog/       # Página principal do blog
│   │   │   ├── post-detail/# Detalhe do post
│   │   │   ├── dashboard/  # Painel administrativo
│   │   │   ├── login/      # Autenticação
│   │   │   ├── about/      # Sobre
│   │   │   └── contact/    # Contato
│   │   ├── services/       # Serviços (API, auth, Instagram, YouTube)
│   │   ├── guards/         # Guards de autenticação
│   │   ├── models/         # Interfaces/tipos
│   │   └── pipes/          # Pipes customizados
│   └── environments/       # Configurações por ambiente
├── backend/                # API Node.js
│   ├── src/
│   │   ├── index.ts        # Entry point (Express)
│   │   ├── config/         # Configurações (DB, env)
│   │   ├── routes/         # Rotas da API
│   │   ├── middleware/     # Auth middleware (JWT)
│   │   └── seed.ts         # Seed do banco
│   ├── prisma/             # Schema e migrations
│   ├── Dockerfile          # Container para deploy
│   └── esbuild.config.js   # Build config
├── azure/                  # Scripts de provisionamento Azure
└── vercel.json             # Config do Vercel
```

---

## 🛠️ Tech Stack

### Frontend
- **Angular 20** com SSR (Server-Side Rendering)
- **Ngx-Quill** — Editor rich text para posts
- **TypeScript 5.8**
- Deploy: **Vercel**

### Backend
- **Express 5** — API REST
- **Prisma 6** — ORM
- **JWT** — Autenticação
- **Multer** — Upload de imagens
- **esbuild** — Bundler
- Deploy: **Azure Container Apps** (Docker)

### Banco de Dados
- **PostgreSQL** via **Neon** (serverless)
- SQLite em desenvolvimento local

### Integrações
- **Instagram Graph API** — Feed de posts
- **YouTube Data API** — Vídeos recentes

---

## 🚀 Setup Local

### Pré-requisitos
- Node.js 20+
- npm 10+

### Frontend

```bash
npm install
npm start
# Acesse http://localhost:4200
```

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run db:seed
npm run dev
# API em http://localhost:3000
```

### Variáveis de Ambiente (backend/.env.development)

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="file:./dev.db"
JWT_SECRET="dev-secret-change-in-production"
UPLOAD_DIR="./uploads"
FRONTEND_URL="http://localhost:4200"
INSTAGRAM_TOKEN="seu-token-aqui"
```

---

## 📡 API Endpoints

### Auth
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/login` | Login (retorna JWT) |
| GET | `/api/auth/me` | Dados do usuário logado |

### Posts
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/posts` | Listar posts publicados |
| GET | `/api/posts/:id` | Detalhe do post |
| POST | `/api/posts` | Criar post (auth) |
| PUT | `/api/posts/:id` | Editar post (auth) |
| DELETE | `/api/posts/:id` | Deletar post (auth) |

### Tags
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/tags` | Listar tags |
| POST | `/api/tags` | Criar tag (auth) |
| DELETE | `/api/tags/:id` | Deletar tag (auth) |

### Comments
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/posts/:id/comments` | Listar comentários |
| POST | `/api/posts/:id/comments` | Criar comentário |

### Upload
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/upload` | Upload de imagem (auth) |

### Instagram
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/instagram/feed` | Feed do Instagram |

### Stats
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/stats` | Estatísticas do blog (auth) |

---

## 🗄️ Modelos do Banco

- **User** — Administradores do blog
- **Post** — Posts com título, conteúdo, excerpt, cover image
- **Photo** — Fotos adicionais do post
- **Comment** — Comentários nos posts
- **Tag** — Categorias/tags
- **PostTag** — Relação many-to-many Post ↔ Tag

---

## 🚢 Deploy

### Frontend (Vercel)
Deploy automático a cada push na branch `main`. Configurado via `vercel.json`.

### Backend (Azure Container Apps)

```bash
# Build da imagem no Azure Container Registry
az acr build --registry pelosolhosderhaacr \
  --image pelosolhosderha-api:latest \
  --file backend/Dockerfile backend/

# Atualizar Container App
az containerapp update \
  --name pelosolhosderha-api \
  --resource-group rg-pelosolhosderha \
  --image pelosolhosderhaacr.azurecr.io/pelosolhosderha-api:latest
```

### Migrations em produção

```bash
DATABASE_URL="sua-url-neon" npx prisma db push
DATABASE_URL="sua-url-neon" npx tsx src/seed.ts
```

---

## 👤 Credenciais Padrão (Seed)

| Email | Senha |
|-------|-------|
| admin@pelosolhosderha.com.br | admin123 |
| rhakramer@gmail.com | admin123 |

> ⚠️ Altere as senhas após o primeiro acesso em produção.

---

## 📄 Licença

Projeto pessoal — Todos os direitos reservados © Rha Kramer
