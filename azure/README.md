<div align="center">

# ☁️ Azure Deployment — Pelos Olhos de Rha

**Documentação completa da implantação na Azure**

Este documento detalha toda a infraestrutura, provisionamento, CI/CD e operações do backend do projeto **Pelos Olhos de Rha** na plataforma Microsoft Azure.

[![Azure App Service](https://img.shields.io/badge/Azure-App%20Service-0078D4?style=for-the-badge&logo=microsoftazure)](https://azure.microsoft.com)
[![Node.js](https://img.shields.io/badge/Runtime-Node.js%2020-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org)
[![Docker](https://img.shields.io/badge/Container-Docker-2496ED?style=for-the-badge&logo=docker)](https://docker.com)
[![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions)](https://github.com/features/actions)
[![Neon](https://img.shields.io/badge/Database-Neon%20PostgreSQL-00E599?style=for-the-badge&logo=postgresql)](https://neon.tech)

</div>

---

## 📋 Índice

- [Visão Geral da Arquitetura](#-visão-geral-da-arquitetura)
- [Ambientes](#-ambientes)
- [Recursos Azure Provisionados](#-recursos-azure-provisionados)
- [Pré-requisitos](#-pré-requisitos)
- [Provisionamento da Infraestrutura](#-provisionamento-da-infraestrutura)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Deploy Manual](#-deploy-manual)
- [Docker](#-docker)
- [Banco de Dados (Neon)](#-banco-de-dados-neon)
- [Monitoramento e Logs](#-monitoramento-e-logs)
- [Custos e Limites](#-custos-e-limites)
- [Troubleshooting](#-troubleshooting)

---

## 🏛️ Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         AZURE CLOUD                              │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            Resource Group: rg-pelosolhosderha             │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │      App Service Plan: plan-pelosolhosderha (F1)    │ │   │
│  │  │                                                      │ │   │
│  │  │  ┌──────────────────┐  ┌───────────────────────┐   │ │   │
│  │  │  │  Web App (prod)  │  │  Web App (homolog)    │   │ │   │
│  │  │  │  pelosolhosderha │  │  pelosolhosderha-     │   │ │   │
│  │  │  │                  │  │  homolog               │   │ │   │
│  │  │  │  Node.js 20 LTS  │  │  Node.js 20 LTS      │   │ │   │
│  │  │  └────────┬─────────┘  └──────────┬────────────┘   │ │   │
│  │  └───────────┼───────────────────────┼─────────────────┘ │   │
│  └──────────────┼───────────────────────┼────────────────────┘   │
│                 │                       │                         │
└─────────────────┼───────────────────────┼─────────────────────────┘
                  │                       │
                  ▼                       ▼
        ┌─────────────────┐    ┌─────────────────┐
        │  Neon PostgreSQL │    │  Neon PostgreSQL │
        │  (main branch)   │    │  (homolog branch)│
        └─────────────────┘    └─────────────────┘

┌─────────────────┐          ┌─────────────────────┐
│  GitHub Actions  │─────────▶│  Azure App Service  │
│  (CI/CD)         │  deploy  │  (auto-deploy)      │
└─────────────────┘          └─────────────────────┘

┌─────────────────┐
│  Vercel          │  ← Frontend (Angular 20 SSR)
│  (SPA Deploy)    │
└─────────────────┘
```

---

## 🌍 Ambientes

| Ambiente | URL Backend | URL Frontend | Banco de Dados | Branch |
|----------|-------------|--------------|----------------|--------|
| **Development** | `http://localhost:3000` | `http://localhost:4200` | SQLite local | `develop` |
| **Homolog** | `https://pelosolhosderha-homolog.azurewebsites.net` | Vercel Preview | Neon (branch `homolog`) | `homolog` |
| **Production** | `https://pelosolhosderha.azurewebsites.net` | `https://pelosolhosderha.vercel.app` | Neon (branch `main`) | `main` |

---

## 📦 Recursos Azure Provisionados

| Recurso | Nome | Tipo | Tier |
|---------|------|------|------|
| Resource Group | `rg-pelosolhosderha` | Grupo de Recursos | — |
| App Service Plan | `plan-pelosolhosderha` | Plano de Hospedagem | F1 (Free) |
| Web App (Production) | `pelosolhosderha` | App Service Linux | Node.js 20 LTS |
| Web App (Homolog) | `pelosolhosderha-homolog` | App Service Linux | Node.js 20 LTS |

**Região:** Brazil South (`brazilsouth`)

---

## 📌 Pré-requisitos

### Ferramentas necessárias

```bash
# Azure CLI
winget install Microsoft.AzureCLI

# Node.js 20+
winget install OpenJS.NodeJS.LTS

# Docker (opcional, para builds locais)
winget install Docker.DockerDesktop

# Git
winget install Git.Git
```

### Contas necessárias

- [Conta Azure](https://azure.microsoft.com/free/) (Free Tier disponível)
- [Conta Neon](https://neon.tech) (PostgreSQL serverless gratuito)
- [Conta GitHub](https://github.com) (para CI/CD)

### Login na Azure CLI

```bash
az login
az account show  # Verificar assinatura ativa
```

---

## 🔧 Provisionamento da Infraestrutura

### Opção 1: Script automatizado

```bash
# Provisionar ambiente de produção
./azure/provision.sh production

# Provisionar ambiente de homologação
./azure/provision.sh homolog
```

### Opção 2: Passo a passo manual

#### 1. Criar Resource Group

```bash
az group create \
  --name rg-pelosolhosderha \
  --location brazilsouth
```

#### 2. Criar App Service Plan (Free Tier)

```bash
az appservice plan create \
  --name plan-pelosolhosderha \
  --resource-group rg-pelosolhosderha \
  --sku F1 \
  --is-linux
```

#### 3. Criar Web Apps

```bash
# Production
az webapp create \
  --name pelosolhosderha \
  --resource-group rg-pelosolhosderha \
  --plan plan-pelosolhosderha \
  --runtime "NODE:20-lts"

# Homolog
az webapp create \
  --name pelosolhosderha-homolog \
  --resource-group rg-pelosolhosderha \
  --plan plan-pelosolhosderha \
  --runtime "NODE:20-lts"
```

#### 4. Configurar Startup Command

```bash
az webapp config set \
  --name pelosolhosderha \
  --resource-group rg-pelosolhosderha \
  --startup-file "node dist/index.js"

az webapp config set \
  --name pelosolhosderha-homolog \
  --resource-group rg-pelosolhosderha \
  --startup-file "node dist/index.js"
```

---

## 🔐 Variáveis de Ambiente

### Configurar no Azure

```bash
# Production
az webapp config appsettings set \
  --name pelosolhosderha \
  --resource-group rg-pelosolhosderha \
  --settings \
    NODE_ENV=production \
    DATABASE_URL="postgresql://user:pass@host/db?sslmode=require" \
    JWT_SECRET="chave-secreta-minimo-32-caracteres" \
    FRONTEND_URL="https://pelosolhosderha.vercel.app" \
    INSTAGRAM_TOKEN="seu-token-instagram"

# Homolog
az webapp config appsettings set \
  --name pelosolhosderha-homolog \
  --resource-group rg-pelosolhosderha \
  --settings \
    NODE_ENV=homolog \
    DATABASE_URL="postgresql://user:pass@host/db-homolog?sslmode=require" \
    JWT_SECRET="chave-secreta-homolog-32-caracteres" \
    FRONTEND_URL="https://pelosolhosderha-preview.vercel.app"
```

### Tabela de Variáveis

| Variável | Descrição | Obrigatória | Exemplo |
|----------|-----------|-------------|---------|
| `NODE_ENV` | Ambiente de execução | ✅ | `production` |
| `DATABASE_URL` | Connection string PostgreSQL (Neon) | ✅ | `postgresql://...` |
| `JWT_SECRET` | Chave para assinar tokens JWT (min. 32 chars) | ✅ | `minha-chave-super-secreta-123` |
| `FRONTEND_URL` | URL do frontend (usado no CORS) | ✅ | `https://pelosolhosderha.vercel.app` |
| `PORT` | Porta do servidor | ❌ | `3000` (default) |
| `UPLOAD_DIR` | Diretório de uploads | ❌ | `./uploads` (default) |
| `INSTAGRAM_TOKEN` | Token da API do Instagram | ❌ | `IGQ...` |

### GitHub Secrets (para CI/CD)

Configure estes secrets no repositório GitHub em **Settings > Secrets and variables > Actions**:

| Secret | Descrição |
|--------|-----------|
| `AZURE_WEBAPP_PUBLISH_PROFILE_PROD` | Publish Profile do App Service de produção |
| `AZURE_WEBAPP_PUBLISH_PROFILE_HOMOLOG` | Publish Profile do App Service de homolog |
| `DATABASE_URL_PROD` | Connection string do banco de produção |
| `DATABASE_URL_HOMOLOG` | Connection string do banco de homolog |

#### Como obter o Publish Profile

```bash
# Production
az webapp deployment list-publishing-profiles \
  --name pelosolhosderha \
  --resource-group rg-pelosolhosderha \
  --xml

# Homolog
az webapp deployment list-publishing-profiles \
  --name pelosolhosderha-homolog \
  --resource-group rg-pelosolhosderha \
  --xml
```

Copie todo o XML retornado e cole no GitHub Secret correspondente.

---

## 🔄 CI/CD Pipeline

O deploy automatizado é feito via **GitHub Actions** definido em [`azure/deploy.yml`](deploy.yml).

### Fluxo do Pipeline

```
Push no GitHub (branch main ou homolog)
         │
         ▼
┌─────────────────────┐
│  Checkout do código  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Setup Node.js 20   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  npm ci (install)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  prisma generate     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  npm run build       │
│  (esbuild → dist/)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Prepare deploy pkg  │
│  (copy deps + prisma)│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────┐
│  Deploy to Azure App Service │
│  (branch main → prod)       │
│  (branch homolog → homolog) │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────┐
│  prisma migrate      │
│  deploy              │
└──────────────────────┘
```

### Triggers

| Branch | Ação | Destino |
|--------|------|---------|
| `main` | Push em `backend/**` | Production (`pelosolhosderha`) |
| `homolog` | Push em `backend/**` | Homolog (`pelosolhosderha-homolog`) |

### Configuração do Workflow

O arquivo [`deploy.yml`](deploy.yml) executa:

1. **Checkout** do repositório
2. **Setup Node.js** 20 com cache de dependências
3. **Install** dependências (`npm ci`)
4. **Generate** Prisma Client
5. **Build** com esbuild (output em `dist/`)
6. **Package** artefatos (dist + node_modules + prisma)
7. **Deploy** para o Azure App Service correto
8. **Migrations** executa `prisma migrate deploy` no banco

---

## 📤 Deploy Manual

Caso necessário, o deploy pode ser feito manualmente:

### Opção 1: ZIP Deploy

```bash
cd backend

# Build
npm ci
npx prisma generate
npm run build

# Preparar pacote
cp package.json dist/
cp package-lock.json dist/
cp -r prisma dist/
cp -r node_modules dist/

# Comprimir
cd dist
zip -r ../deploy.zip .
cd ..

# Deploy
az webapp deployment source config-zip \
  --resource-group rg-pelosolhosderha \
  --name pelosolhosderha \
  --src deploy.zip
```

### Opção 2: Git Deploy

```bash
# Configurar remote do Azure
az webapp deployment source config-local-git \
  --name pelosolhosderha \
  --resource-group rg-pelosolhosderha

# Adicionar remote e push
git remote add azure <url-retornada>
git push azure main
```

### Executar Migrações Manualmente

```bash
# Conectar ao banco de produção
DATABASE_URL="sua-connection-string" npx prisma migrate deploy
```

---

## 🐳 Docker

O projeto inclui um `Dockerfile` multi-stage otimizado para produção.

### Build da Imagem

```bash
cd backend
docker build -t pelosolhosderha-backend .
```

### Executar Localmente

```bash
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="sua-chave" \
  -e FRONTEND_URL="http://localhost:4200" \
  pelosolhosderha-backend
```

### Dockerfile (Multi-stage)

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate
COPY tsconfig.json esbuild.config.js ./
COPY src ./src
RUN npm run build

# Stage 2: Run
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./
RUN mkdir -p uploads
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
```

### Alternativa: Azure Container Apps

Para uso com Container Apps (pay-per-use):

```bash
# Criar Container App Environment
az containerapp env create \
  --name env-pelosolhosderha \
  --resource-group rg-pelosolhosderha \
  --location brazilsouth

# Deploy da imagem
az containerapp create \
  --name pelosolhosderha-api \
  --resource-group rg-pelosolhosderha \
  --environment env-pelosolhosderha \
  --image pelosolhosderha-backend:latest \
  --target-port 3000 \
  --ingress external \
  --env-vars NODE_ENV=production DATABASE_URL=secretref:db-url JWT_SECRET=secretref:jwt-secret
```

---

## 🗃️ Banco de Dados (Neon)

O projeto utiliza o [Neon](https://neon.tech) como banco PostgreSQL serverless.

### Setup

1. Crie uma conta em [neon.tech](https://neon.tech)
2. Crie um novo projeto chamado `pelosolhosderha`
3. Copie a **connection string** fornecida

### Branches de Banco

| Branch Neon | Ambiente | Uso |
|-------------|----------|-----|
| `main` | Production | Banco principal |
| `homolog` | Homolog | Testes e validação |

#### Criar branch de homolog no Neon

1. Acesse o console do Neon
2. Vá em **Branches** > **Create Branch**
3. Nome: `homolog`, Parent: `main`
4. Copie a connection string da nova branch

### Migrações

```bash
# Gerar nova migração (desenvolvimento)
npm run db:migrate:dev

# Aplicar migrações em homolog
npm run db:migrate:homolog

# Aplicar migrações em produção
npm run db:migrate:prod
```

### Schema atual

As entidades principais são:

- **User** — Administradores do blog
- **Post** — Posts do blog (título, conteúdo, excerpt, capa)
- **Tag** — Tags coloridas para categorização
- **PostTag** — Relação N:N entre Posts e Tags
- **Photo** — Galeria de fotos dos posts
- **Comment** — Comentários dos visitantes

---

## 📊 Monitoramento e Logs

### Ver logs em tempo real

```bash
# Production
az webapp log tail \
  --name pelosolhosderha \
  --resource-group rg-pelosolhosderha

# Homolog
az webapp log tail \
  --name pelosolhosderha-homolog \
  --resource-group rg-pelosolhosderha
```

### Ativar logging

```bash
az webapp log config \
  --name pelosolhosderha \
  --resource-group rg-pelosolhosderha \
  --application-logging filesystem \
  --level information
```

### Verificar status do app

```bash
az webapp show \
  --name pelosolhosderha \
  --resource-group rg-pelosolhosderha \
  --query "state"

# Testar endpoint
curl https://pelosolhosderha.azurewebsites.net/api/posts
```

### Restart do App

```bash
az webapp restart \
  --name pelosolhosderha \
  --resource-group rg-pelosolhosderha
```

---

## 💰 Custos e Limites

### Free Tier (F1) — Atual

| Recurso | Limite |
|---------|--------|
| CPU | 60 minutos/dia |
| RAM | 1 GB |
| Storage | 1 GB |
| Custom Domain SSL | ❌ (usa `*.azurewebsites.net`) |
| Scale Out | ❌ (1 instância) |
| Always On | ❌ (app "dorme" após inatividade) |
| **Custo** | **Gratuito** |

### Upgrade recomendado: Basic (B1)

| Recurso | Limite |
|---------|--------|
| CPU | Ilimitado |
| RAM | 1.75 GB |
| Storage | 10 GB |
| Custom Domain SSL | ✅ |
| Scale Out | Até 3 instâncias |
| Always On | ✅ |
| **Custo** | **~$13/mês** |

### Alternativa: Azure Container Apps (Consumption)

| Recurso | Free Tier |
|---------|-----------|
| Requests | 2 milhões/mês grátis |
| vCPU-seconds | 180.000/mês grátis |
| Memory | 360.000 GiB-s/mês grátis |
| **Custo** | **Gratuito** (dentro dos limites) |

> 💡 **Recomendação:** Para blogs com tráfego baixo/médio, o Free Tier F1 é suficiente. Se o app "dormir" por inatividade for um problema, considere o B1 ou Container Apps.

---

## 🔧 Troubleshooting

### App não inicia / Error 500

```bash
# Verificar logs
az webapp log tail --name pelosolhosderha --resource-group rg-pelosolhosderha

# Verificar variáveis configuradas
az webapp config appsettings list --name pelosolhosderha --resource-group rg-pelosolhosderha

# Restart
az webapp restart --name pelosolhosderha --resource-group rg-pelosolhosderha
```

### Erro de conexão com banco

- Verifique se a `DATABASE_URL` está correta
- Confirme que o IP do Azure está liberado no Neon (Neon permite todas as conexões por padrão)
- Verifique se `?sslmode=require` está na connection string

### Deploy falha no GitHub Actions

- Verifique se os secrets `AZURE_WEBAPP_PUBLISH_PROFILE_*` estão configurados
- Regenere o Publish Profile se expirado:
  ```bash
  az webapp deployment list-publishing-profiles \
    --name pelosolhosderha \
    --resource-group rg-pelosolhosderha --xml
  ```

### App "dorme" após inatividade (Free Tier)

Isso é normal no F1. O app leva ~20-30s para "acordar" após período de inatividade. Opções:
1. Aceitar o cold start
2. Usar um serviço de ping (UptimeRobot, etc.)
3. Upgrade para B1 com Always On

### Migrações falham

```bash
# Verificar status das migrações
DATABASE_URL="..." npx prisma migrate status

# Resetar banco (⚠️ APAGA DADOS)
DATABASE_URL="..." npx prisma migrate reset
```

---

## 🗂️ Arquivos deste diretório

```
azure/
├── README.md       # Este arquivo
├── deploy.yml      # GitHub Actions workflow (CI/CD)
└── provision.sh    # Script de provisionamento Azure
```

---

<div align="center">

**Pelos Olhos de Rha** — Infraestrutura Azure

Desenvolvido por [Rhayssa Kramer](https://github.com/rhayssakramer)

</div>
