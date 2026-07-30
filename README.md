<div align="center">

# 👁️ Pelos Olhos de Rha

**Blog Pessoal & Portfólio Criativo**

Pelos Olhos de Rha é um blog pessoal e portfólio criativo que combina escrita, fotografia e conteúdo visual. Uma plataforma para compartilhar experiências, reflexões e criações artísticas com o mundo — tudo isso através de uma interface moderna e intuitiva.

[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org)
[![Frontend](https://img.shields.io/badge/Frontend-Angular%2020-DD0031?style=for-the-badge&logo=angular)](https://angular.dev)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20(Neon)-4169E1?style=for-the-badge&logo=postgresql)](https://neon.tech)
[![Deploy Backend](https://img.shields.io/badge/Deploy-Azure%20Container%20Apps-0078D4?style=for-the-badge&logo=microsoftazure)](https://azure.microsoft.com)
[![Deploy Frontend](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com)

</div>

---

## 📋 Índice

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

| Ambiente | Banco de Dados |
|----------|----------------|
| Homolog | PostgreSQL (Neon) |
| Production | PostgreSQL (Neon) |

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

| Serviço | Finalidade |
|---------|-----------|
| Azure Container Apps | Deploy do backend (Docker) |
| Vercel | Deploy do frontend (SPA Angular) |
| Neon | Banco de dados PostgreSQL serverless |
| GitHub | Controle de versão |
| Azure Pipelines | CI/CD |

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
# Edite o .env com suas configurações (DATABASE_URL, JWT_SECRET, etc.)

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

**Credenciais padrão (seed):**
- Email: `admin@pelosolhosderha.com.br` ou `rhakramer@gmail.com`
- Senha: `admin123`

> ⚠️ **Troque as senhas em produção!**

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

### Backend

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `DATABASE_URL` | URL de conexão PostgreSQL (Neon) | ✅ |
| `JWT_SECRET` | Chave secreta para assinatura JWT (mín. 32 caracteres) | ✅ |
| `PORT` | Porta do servidor (default: 3000) | ❌ |
| `NODE_ENV` | Ambiente (`development`, `homolog`, `production`) | ❌ |
| `UPLOAD_DIR` | Diretório de uploads (default: `./uploads`) | ❌ |
| `INSTAGRAM_TOKEN` | Token de acesso da API do Instagram | ❌ |
| `AZURE_STORAGE_ACCOUNT_NAME` | Conta de armazenamento Azure (produção) | ❌ |
| `AZURE_STORAGE_ACCOUNT_KEY` | Chave de acesso Azure (produção) | ❌ |
| `AZURE_STORAGE_CONTAINER_NAME` | Container Azure para uploads (produção) | ❌ |

**Veja também:** [Backend — Variáveis de Ambiente](./backend/README.md#-variáveis-de-ambiente)

---

## 🚢 Deploy

### Backend — Azure Container Apps (Docker)

O backend é containerizado e deployado no **Azure Container Apps**.

```bash
# Build da imagem Docker
cd backend
docker build -t pelosolhosderha-backend .

# Build para produção
npm run build
```

O pipeline de CI/CD está configurado em [`azure/deploy.yml`](azure/deploy.yml).

### Frontend — Vercel

O frontend é deployado automaticamente na **Vercel** a cada push na branch `main`.

A configuração está em [`vercel.json`](vercel.json):
- **Build command:** `npx ng build --configuration production`
- **Output directory:** `dist/pelosolhosderha/browser`

#### Build Manual

```bash
# Build para produção
npm run build

# Teste local do SSR
npm run serve:ssr:pelosolhosderha
```

### URLs dos Ambientes

| Ambiente | Backend | Frontend |
|----------|---------|---------|
| Development | `http://localhost:3000` | `http://localhost:4200` |
| Production | Azure Container Apps | `https://pelosolhosderha.vercel.app` |

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

## � Últimas Mudanças

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
- CORS agora permite staging e preview environments
- Token JWT validado e documentado

#### 📚 Documentação

- [Backend CORS Configuration](./backend/README.md#-cors-cross-origin-resource-sharing)
- [Backend Troubleshooting](./backend/README.md#-troubleshooting)
- [Autenticação JWT](#-autenticação)
- [Upload de Imagens](#-upload-de-imagens)

---

## �👥 Créditos

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
