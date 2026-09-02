<div align="center">

# 👁️ Pelos Olhos de Rha

**Blog Pessoal & Portfólio Criativo**

Pelos Olhos de Rha é um blog pessoal e portfólio criativo que combina escrita, fotografia e conteúdo visual. Uma plataforma moderna para compartilhar experiências, reflexões e criações artísticas com o mundo através de uma arquitetura full-stack escalável e otimizada.

[![Backend](https://img.shields.io/badge/Backend-Node.js%2020%2B%20Express%205-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org)
[![Frontend](https://img.shields.io/badge/Frontend-Angular%2020-DD0031?style=for-the-badge&logo=angular)](https://angular.dev)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20Neon-4169E1?style=for-the-badge&logo=postgresql)](https://neon.tech)
[![Deploy Backend](https://img.shields.io/badge/Deploy-Azure%20Container%20Apps-0078D4?style=for-the-badge&logo=microsoftazure)](https://azure.microsoft.com)
[![Deploy Frontend](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**Status:** ✅ Em Produção | **Versão:** 2.0.0 | **Última Atualização:** Agosto 2026

</div>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Executando o Projeto](#-executando-o-projeto)
- [Estrutura do Repositório](#-estrutura-do-repositório)
- [API Endpoints](#-api-endpoints)
- [Autenticação e Segurança](#-autenticação-e-segurança)
- [Upload de Imagens](#-upload-de-imagens)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Deploy e Infraestrutura](#-deploy-e-infraestrutura)
- [Desenvolvimento](#-desenvolvimento)
- [Troubleshooting](#-troubleshooting)
- [Créditos](#-créditos)

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Estrutura do Repositório](#-estrutura-do-repositório)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Configuração](#-instalação-e-configuração)
- [Executando o Projeto](#-executando-o-projeto)
- [API Endpoints](#-api-endpoints)
- [Autenticação](#-autenticação)
- [Upload de Imagens](#-upload-de-imagens)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Deploy](#-deploy)
- [Modelos de Dados](#-modelos-de-dados)
- [Últimas Mudanças](#-últimas-mudanças)
- [Créditos](#-créditos)

---

## 🌟 Sobre o Projeto

O **Pelos Olhos de Rha** é um blog pessoal que une escrita criativa, fotografia e conteúdo multimídia em uma plataforma elegante e responsiva. O projeto foi desenvolvido como uma aplicação full stack moderna com foco em performance, SEO e experiência do usuário.

A plataforma permite:

- 📝 Publicar posts com editor rich-text (Quill)
- 📸 Galeria de fotos integrada a cada post
- 🏷️ Organizar conteúdo com tags coloridas
- 💬 Sistema de comentários interativo
- 📊 Dashboard administrativo com estatísticas
- 📷 Integração com Instagram Feed
- 🎥 Integração com YouTube

Ideal para **criadores de conteúdo**, **fotógrafos**, **escritores** e **artistas** que desejam manter um portfólio digital completo e profissional.

---

## ✨ Funcionalidades

### Para Administradores
- ✅ Dashboard completo com estatísticas do blog
- ✅ Criar, editar e publicar posts com editor rich-text
- ✅ Gerenciar tags (criar, editar, excluir com cores personalizadas)
- ✅ Upload de imagens de capa e fotos nos posts
- ✅ Gerenciar integração com Instagram
- ✅ Visualizar métricas de acesso e engajamento

### Para Visitantes
- ✅ Navegar pelo blog com design responsivo
- ✅ Buscar posts por título, conteúdo ou tags
- ✅ Visualizar posts completos com galeria de fotos
- ✅ Deixar comentários nos posts
- ✅ Filtrar posts por tags
- ✅ Acessar feed do Instagram integrado
- ✅ Página Sobre e Contato

### Geral
- ✅ Autenticação JWT para área administrativa
- ✅ Server-Side Rendering (SSR) para SEO
- ✅ Design responsivo (mobile-first)
- ✅ Upload de imagens com armazenamento seguro
- ✅ API RESTful com paginação
- ✅ Sistema de tags com cores personalizáveis

---

## 🏛️ Arquitetura

O projeto é uma aplicação **full stack** dividida em dois serviços independentes:

```
pelosolhosderha/
├── backend/   → API REST em Node.js + Express + Prisma
└── src/       → SPA em Angular 20 com SSR
```

### Backend — Arquitetura em Camadas

```
Routes  →  Middleware (Auth)  →  Prisma ORM  →  PostgreSQL (Neon)
```

- **Routes**: Definem os endpoints REST e contêm a lógica de negócio
- **Middleware**: Autenticação JWT para rotas protegidas
- **Prisma ORM**: Acesso ao banco de dados com type-safety
- **Config**: Variáveis de ambiente e configurações centralizadas

### Frontend — Angular 20 com SSR

```
Components  →  Services  →  HTTP Client  →  Backend API
```

- **Components**: Componentes reutilizáveis (blog, dashboard, post-detail, etc.)
- **Services**: Serviços para comunicação com a API
- **Guards**: Proteção de rotas administrativas
- **Pipes**: Transformações de dados (SafePipe para HTML)

### Banco de Dados

| Ambiente | Banco de Dados | Conexão |
|----------|----------------|---------|
| Development | SQLite (local) | `file:./dev.db` |
| Homologação | PostgreSQL (Neon) | Branch `homolog` |
| Production | PostgreSQL (Neon) | Branch `production` |

---

## 💻 Tecnologias

### Backend

| Categoria | Tecnologia | Versão |
|-----------|-----------|--------|
| Runtime | Node.js | 20+ |
| Framework | Express | 5.1 |
| Linguagem | TypeScript | 5.7 |
| ORM | Prisma | 6.0 |
| Banco | PostgreSQL (Neon) | 15+ |
| Autenticação | JWT (jsonwebtoken) | 9.0 |
| Hash de Senha | bcryptjs | 2.4 |
| Upload | Multer | 1.4 |
| Build | esbuild | 0.24 |
| Containerização | Docker | — |

### Frontend

| Categoria | Tecnologia | Versão |
|-----------|-----------|--------|
| Framework | Angular | 20.0 |
| Linguagem | TypeScript | 5.7 |
| SSR | Angular SSR | 20.0 |
| Editor Rich-Text | ngx-quill + Quill | 30.1 / 2.0 |
| Reatividade | RxJS | 7.8 |
| Build | Angular CLI | 20.0 |

### DevOps & Infraestrutura

| Serviço | Propósito | Ambientes |
|---------|----------|-----------|
| Vercel | Deploy frontend | Development, Homologação |
| Azure Container Apps | Deploy backend | Production |
| Neon | PostgreSQL serverless | Development, Homologação, Production |
| GitHub | Controle de versão | Branches: dev, homolog, main |
| Azure Pipelines | CI/CD Production | Production |
| Azure Static Web App | Frontend alternativo | Production |

---

## 📁 Estrutura do Repositório

```
pelosolhosderha/
├── README.md                          # Este arquivo
├── angular.json                       # Configuração do Angular CLI
├── package.json                       # Dependências do frontend
├── tsconfig.json                      # Configuração TypeScript
├── vercel.json                        # Configuração de deploy Vercel
│
├── azure/                             # Scripts de infraestrutura Azure
│   ├── deploy.yml                     # Pipeline de deploy
│   └── provision.sh                   # Provisionamento de recursos
│
├── backend/                           # API REST Node.js + Express
│   ├── Dockerfile                     # Imagem Docker do backend
│   ├── package.json                   # Dependências do backend
│   ├── esbuild.config.js             # Configuração de build
│   ├── tsconfig.json                  # TypeScript config
│   ├── prisma/
│   │   ├── schema.prisma             # Schema do banco (produção)
│   │   ├── schema.dev.prisma         # Schema do banco (desenvolvimento)
│   │   └── migrations/               # Migrações do Prisma
│   └── src/
│       ├── index.ts                   # Ponto de entrada do servidor
│       ├── seed.ts                    # Seed do banco de dados
│       ├── config/
│       │   ├── database.ts            # Configuração do Prisma Client
│       │   └── env.ts                 # Variáveis de ambiente
│       ├── middleware/
│       │   └── auth.middleware.ts     # Middleware de autenticação JWT
│       └── routes/
│           ├── auth.routes.ts         # Autenticação (login)
│           ├── post.routes.ts         # CRUD de posts
│           ├── comment.routes.ts      # Comentários
│           ├── tag.routes.ts          # CRUD de tags
│           ├── upload.routes.ts       # Upload de imagens
│           └── stats.routes.ts        # Estatísticas do blog
│
└── src/                               # Frontend Angular 20
    ├── index.html                     # Template HTML
    ├── main.ts                        # Bootstrap do Angular
    ├── main.server.ts                 # Bootstrap SSR
    ├── server.ts                      # Servidor Express para SSR
    ├── styles.css                     # Estilos globais
    └── app/
        ├── app.ts                     # Componente raiz
        ├── app.routes.ts              # Rotas da aplicação
        ├── app.config.ts              # Configuração (providers)
        ├── components/
        │   ├── blog/                  # Página principal do blog
        │   ├── post-detail/           # Detalhe de um post
        │   ├── about/                 # Página Sobre
        │   ├── contact/               # Página Contato
        │   ├── login/                 # Página de Login
        │   └── dashboard/             # Painel Administrativo
        │       ├── post-editor/       # Editor de posts (Quill)
        │       ├── posts-list/        # Lista de posts
        │       ├── tag-manager/       # Gerenciador de tags
        │       ├── stats/             # Estatísticas
        │       └── instagram-manager/ # Gerenciar Instagram
        ├── guards/
        │   └── auth.guard.ts          # Guard de autenticação
        ├── models/
        │   └── post.model.ts          # Interfaces (Post, Tag, Comment)
        ├── pipes/
        │   └── safe.pipe.ts           # Pipe para HTML seguro
        └── services/
            ├── auth.service.ts        # Serviço de autenticação
            ├── blog.service.ts        # Serviço do blog (posts, tags)
            ├── instagram.service.ts   # Serviço Instagram
            ├── stats.service.ts       # Serviço de estatísticas
            └── youtube.service.ts     # Serviço YouTube
```

---

## 📌 Pré-requisitos

### Para rodar o backend localmente
- [Node.js 20+](https://nodejs.org/)
- npm 10+
- PostgreSQL 15+ (ou conta no [Neon](https://neon.tech))

### Para rodar o frontend localmente
- [Node.js 20+](https://nodejs.org/)
- npm 10+

### Opcional
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (para rodar o backend containerizado)

---

## 🔧 Instalação e Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/rhayssakramer/pelosolhosderha.git
cd pelosolhosderha
```

### 2. Configuração do Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com seus valores (banco de dados, JWT, etc.)
# **⚠️ Nunca commite .env com credenciais reais**

# Gerar o Prisma Client
npm run db:generate

# Executar migrações
npm run db:migrate:dev

# (Opcional) Popular banco com dados iniciais
npm run db:seed
```

### 3. Configuração do Frontend

```bash
# Na raiz do projeto
npm install
```

---

## 🚀 Executando o Projeto

### Backend

```bash
cd backend

# Modo desenvolvimento com hot reload
npm run dev
```

Disponível em: **`http://localhost:3000`**

### Frontend

```bash
# Na raiz do projeto
npm start
```

Disponível em: **`http://localhost:4200`**

### Com Docker (Backend)

```bash
cd backend
docker build -t pelosolhosderha-backend .
docker run -p 3000:3000 --env-file .env pelosolhosderha-backend
```

---

## 📡 API Endpoints

### Autenticação — `/api/auth`

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/auth/login` | Login e obtenção do JWT | ❌ |
| GET | `/api/auth/me` | Dados do usuário autenticado | ✅ |

### Posts — `/api/posts`

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/posts` | Listar posts publicados (paginado) | ❌ |
| GET | `/api/posts/:id` | Buscar post por ID | ❌ |
| POST | `/api/posts` | Criar novo post | ✅ |
| PUT | `/api/posts/:id` | Atualizar post | ✅ |
| DELETE | `/api/posts/:id` | Deletar post | ✅ |

**Query params de listagem:**
- `page` — Página (default: 1)
- `limit` — Posts por página (default: 10)
- `tag` — Filtrar por tag

### Tags — `/api/tags`

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/tags` | Listar todas as tags | ❌ |
| POST | `/api/tags` | Criar nova tag | ✅ |
| PUT | `/api/tags/:id` | Atualizar tag | ✅ |
| DELETE | `/api/tags/:id` | Deletar tag | ✅ |

### Comentários — `/api/comments`

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/comments/:postId` | Listar comentários de um post | ❌ |
| POST | `/api/comments` | Criar comentário | ❌ |
| DELETE | `/api/comments/:id` | Deletar comentário | ✅ |

### Upload — `/api/upload`

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/upload` | Upload de imagem | ✅ |

### Estatísticas — `/api/stats`

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/stats` | Estatísticas do blog | ✅ |

### Instagram — `/api/instagram`

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/instagram/feed` | Feed do Instagram | ❌ |

Endpoints marcados com ✅ requerem o header:
## 🔑 Autenticação

O sistema usa **JWT (JSON Web Tokens)** com validade de **7 dias**.


**Fluxo:**
1. Login: `POST /api/auth/login` com email + senha
2. Resposta contém token JWT
3. Usar em requisições protegidas: `Authorization: Bearer <token>`
4. Token expira em 7 dias (fazer login novamente)

---

## 📸 Upload de Imagens

**Configuração:**
- Tipos aceitos: JPEG, JPG, PNG, GIF, WebP
- Tamanho máximo: 10 MB por arquivo
- Autenticação: Requerida (JWT token)
- Armazenamento em desenvolvimento: Local (`/backend/uploads`)
- Armazenamento em produção: Azure Blob Storage

**Endpoints:**
- `POST /api/upload` — Upload de imagem única
- `POST /api/upload/multiple` — Upload de múltiplas imagens (máx 20)

---

## 🔐 Variáveis de Ambiente

### Estrutura Multi-Ambiente

O projeto suporta **três ambientes independentes**:

| Ambiente | Frontend | Backend | Database | URL |
|----------|----------|---------|----------|-----|
| **Development** | Localhost:4200 | Localhost:3000 | SQLite (local) | http://localhost:4200 |
| **Homologação** | Vercel (homolog) | Vercel (homolog) | PostgreSQL Neon (homolog branch) | pelosolhosderha-homolog.vercel.app |
| **Production** | Azure Static Web App (main) | Azure Container Apps (main) | PostgreSQL Neon (production branch) | www.pelosolhosderha.com.br |

Cada ambiente tem seu próprio `.env.{environment}` com configurações específicas.

### Backend

| Variável | Descrição | Obrigatória | Ambientes |
|----------|-----------|-------------|-----------|
| `DATABASE_URL` | URL de conexão do banco (PostgreSQL Neon ou SQLite) | ✅ | dev, homolog, prod |
| `JWT_SECRET` | Chave secreta para JWT (mín. 32 caracteres, aleatória e forte) | ✅ | dev, homolog, prod |
| `NODE_ENV` | Ambiente (`development`, `homolog`, `production`) | ✅ | dev, homolog, prod |
| `PORT` | Porta do servidor (default: 3000) | ❌ | dev, homolog, prod |
| `FRONTEND_URL` | URL do frontend para CORS | ✅ | dev, homolog, prod |
| `API_URL` | URL pública da API | ✅ | dev, homolog, prod |
| `UPLOAD_DIR` | Diretório de uploads locais (default: `./uploads`) | ❌ | dev |
| `INSTAGRAM_TOKEN` | Token de acesso da API Instagram | ❌ | homolog, prod |
| `AZURE_STORAGE_CONNECTION_STRING` | String de conexão Azure Blob Storage | ❌ | homolog, prod |
| `AZURE_STORAGE_CONTAINER` | Container para uploads (default: `uploads`) | ❌ | homolog, prod |
| `EMAIL_SERVICE` | Serviço de email configurado | ❌ | homolog, prod |
| `EMAIL_USER` | Email de sistema (não usar email pessoal) | ❌ | homolog, prod |
| `EMAIL_PASSWORD` | Senha de app email (usar app-specific passwords) | ❌ | homolog, prod |

### Frontend

| Variável | Descrição | Obrigatória | Ambientes |
|----------|-----------|-------------|-----------|
| `apiUrl` | URL base da API backend | ✅ | dev, homolog, prod |
| `siteUrl` | URL pública do site | ✅ | dev, homolog, prod |
| `googleClientId` | Client ID Google OAuth | ✅ | dev, homolog, prod |

Configuradas em `src/environments/environment.{environment}.ts`

**Veja também:** [Backend — Variáveis de Ambiente](./backend/README.md#-variáveis-de-ambiente)

---

## 🚢 Deploy

### Ambientes de Deploy

Este projeto está configurado para **três ambientes independentes** com automação e isolamento completo:

#### 🔧 Development
- **Frontend:** Localhost (Angular - porta 4200)
- **Backend:** Localhost (Node.js - porta 3000)
- **Database:** SQLite (arquivo local `dev.db`)
- **URLs:**
  - Frontend: `http://localhost:4200`
  - Backend: `http://localhost:3000/api`
- **Como usar:** `npm start` (frontend) + `npm run dev` (backend)
- **Deploy:** Não requer git push - tudo roda localmente

#### 🧪 Homologação
- **Frontend:** Vercel (Branch `homolog`)
- **Backend:** Vercel (Branch `homolog` - serverless functions)
- **Database:** PostgreSQL (Neon - branch `homolog`)
- **URLs:**
  - Frontend: `https://pelosolhosderha-homolog.vercel.app`
  - Backend: `https://pelosolhosderha-homolog.vercel.app/api` (mesma origem)
- **Auto-deploy:** Sim, ao fazer push na branch `homolog`

#### 🚀 Production
- **Frontend:** Azure Static Web App (Branch `main`)
- **Backend:** Azure Container Apps (Branch `main` - Docker)
- **Backend:** Azure Container Apps (Docker)
- **Database:** PostgreSQL (Neon - branch `production`)
- **URL:** www.pelosolhosderha.com.br
- **Auto-deploy:** Sim via Azure Pipeline

### Backend — Production (Azure Container Apps)

```bash
# Build da imagem Docker
cd backend
docker build -t pelosolhosderha-backend .

# Push para Azure Container Registry
az acr build --registry [seu-registry] --image pelosolhosderha-backend:latest .

# Deploy no Container Apps
az containerapp create \
  --name pelosolhosderha-api \
  --resource-group [seu-resource-group] \
  --image [seu-registry].azurecr.io/pelosolhosderha-backend:latest
```

Pipeline de CI/CD configurado em `azure/deploy.yml`.

### Frontend — Vercel

Deployment automático configurado em `vercel.json`:

```bash
# Build para qualquer ambiente
ng build --configuration [development|homolog|production]

# Ou usar scripts npm
npm run build                  # Production
npm run build:homolog          # Homologação
```

**Build automático:** Toda atualização em `dev` e `homolog` branches é deployada automaticamente no Vercel.

### Configuração de Ambientes

| Ambiente | Branch Git | Variáveis | Scripts |
|----------|-----------|-----------|---------|
| Development | `dev` | `.env.development` | `npm run dev` |
| Homologação | `homolog` | `.env.homolog` | `npm run build:homolog` |
| Production | `main` | `.env.production` | `npm run build` |

---

## 📐 Modelos de Dados

### User

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | String (UUID) | Identificador único |
| `email` | String | E-mail único |
| `password` | String | Hash BCrypt |
| `name` | String | Nome completo |
| `role` | String | Papel (default: "admin") |
| `createdAt` | DateTime | Data de criação |
| `updatedAt` | DateTime | Data da última atualização |

### Post

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | String (UUID) | Identificador único |
| `title` | String | Título do post |
| `content` | String | Conteúdo HTML (rich-text) |
| `excerpt` | String | Resumo do post |
| `coverImage` | String? | URL da imagem de capa |
| `published` | Boolean | Se está publicado |
| `authorId` | String | FK para User |
| `createdAt` | DateTime | Data de criação |
| `updatedAt` | DateTime | Data da última atualização |

### Tag

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | String (UUID) | Identificador único |
| `name` | String | Nome único da tag |
| `color` | String | Cor hexadecimal (default: "#6366f1") |

### Photo

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | String (UUID) | Identificador único |
| `url` | String | URL da imagem |
| `caption` | String? | Legenda |
| `order` | Int | Ordem de exibição |
| `postId` | String | FK para Post |

### Comment

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | String (UUID) | Identificador único |
| `text` | String | Texto do comentário |
| `name` | String | Nome do autor |
| `avatar` | String? | URL do avatar |
| `postId` | String | FK para Post |
| `userId` | String? | FK para User (opcional) |
| `createdAt` | DateTime | Data de criação |

---

## 📝 Últimas Mudanças

### Setembro 2, 2026

#### 🔐 Melhorias de Segurança

**Documentação:**
- ✅ Remoção de exemplos com credenciais sensíveis de todos os READMEs
- ✅ Substituição de valores reais por placeholders em `.env` exemplo
- ✅ Removidos emails de exemplo de documentação
- ✅ Adicionado aviso sobre `.gitignore` para arquivos `.env`
- ✅ Melhoria de instrução de segurança em variáveis de ambiente

**Backend:**
- ✅ Exemplos de cURL com dados sanitizados
- ✅ Documentação de JWT sem expor segredos

**Frontend:**
- ✅ Variáveis de ambiente documentadas sem valores sensíveis
- ✅ Orientações de segurança para credenciais adicionadas

**Boas Práticas:**
- ✅ Recomendação de usar `app-specific passwords` para email
- ✅ Alertas sobre não usar emails pessoais em variáveis de ambiente
- ✅ Limpeza de comentários com dados sensíveis

---

## 📊 Histórico de Mudanças Anteriores

### Julho 30, 2026

#### 🔧 Mudanças Recentes

**Backend:**
- ✅ Configuração de CORS atualizada com múltiplas origens permitidas
- ✅ Adicionado suporte a Azure Blob Storage para uploads em produção
- ✅ Seção de Troubleshooting adicionada ao README
- ✅ Documentação de autenticação JWT expandida
- ✅ Variáveis de ambiente para Azure Storage documentadas

**Frontend:**
- ✅ Interceptor de autenticação validado e funcionando
- ✅ Upload de imagens com tratamento de erro 401 melhorado
- ✅ Suporte a múltiplos domínios de frontend

**Documentação:**
- ✅ Todos os READMEs atualizados com informações de CORS
- ✅ Guia de autenticação JWT adicionado
- ✅ Informações de upload de imagens expandidas
- ✅ Tabelas de variáveis de ambiente completas

#### 🐛 Correções

- Resolvido erro 401 no upload de imagens (CORS)
- CORS configurável para múltiplos ambientes (development, homologação, production)
- Token JWT validado e documentado

#### 📚 Documentação

- [Backend CORS Configuration](./backend/README.md#-cors-cross-origin-resource-sharing)
- [Backend Troubleshooting](./backend/README.md#-troubleshooting)
- [Autenticação JWT](#-autenticação)
- [Upload de Imagens](#-upload-de-imagens)

---

## 👥 Créditos

<p><strong>Veja o mundo pelos olhos de Rha.</strong></p>

_Nota: Este projeto é apenas para fins pessoais e educacionais e não possui nenhuma afiliação oficial._

## 👩🏼‍💻 Autora:
<table style="border=0">
  <tr>
    <td align="left">
      <a href="https://github.com/rhayssakramer">
        <span><b>Rhayssa Kramer</b></span>
      </a>
      <br>
      <span>Sr. Assoc, Full-Stack Development</span>
    </td>
  </tr>
</table>
<div align="center"><p>© 2026 Pelos Olhos de Rha. Todos os direitos reservados.</p></div>

<div align="center"><a href="https://github.com/rhayssakramer"><img src="https://github.com/rhayssakramer/rhayssakramer/blob/main/img/rodape.png"></a></div>
