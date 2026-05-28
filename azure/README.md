# Azure Deployment - Pelos Olhos de Rha

## Estratégia: Azure App Service (Free Tier F1)

A opção mais barata/gratuita para hospedar o backend Node.js no Azure é o **Azure App Service Free Tier (F1)**.

### Limites do Free Tier (F1):
- 60 min CPU/dia
- 1 GB RAM
- 1 GB storage
- Sem custom domain SSL (pode usar `*.azurewebsites.net`)
- Sem scale out

> Para produção com mais tráfego, considere o **B1 (Basic)** ~$13/mês.

---

## Ambientes

| Ambiente   | URL                                              | Banco           |
|------------|--------------------------------------------------|-----------------|
| develop    | http://localhost:3000                             | SQLite local    |
| homolog    | https://pelosolhosderha-homolog.azurewebsites.net | Neon (branch)   |
| production | https://pelosolhosderha.azurewebsites.net         | Neon (main)     |

---

## Setup Passo a Passo

### 1. Pré-requisitos
```bash
# Instalar Azure CLI
winget install Microsoft.AzureCLI

# Login
az login
```

### 2. Criar Resource Group
```bash
az group create --name rg-pelosolhosderha --location brazilsouth
```

### 3. Criar App Service Plan (Free)
```bash
az appservice plan create \
  --name plan-pelosolhosderha \
  --resource-group rg-pelosolhosderha \
  --sku F1 \
  --is-linux
```

### 4. Criar Web Apps
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

### 5. Configurar Variáveis de Ambiente

```bash
# Production
az webapp config appsettings set \
  --name pelosolhosderha \
  --resource-group rg-pelosolhosderha \
  --settings \
    NODE_ENV=production \
    DATABASE_URL="sua-url-neon-production" \
    JWT_SECRET="seu-secret-forte" \
    FRONTEND_URL="https://seusite.com"

# Homolog
az webapp config appsettings set \
  --name pelosolhosderha-homolog \
  --resource-group rg-pelosolhosderha \
  --settings \
    NODE_ENV=homolog \
    DATABASE_URL="sua-url-neon-homolog" \
    JWT_SECRET="seu-secret-homolog" \
    FRONTEND_URL="https://seusite-homolog.com"
```

### 6. Deploy via GitHub Actions (recomendado)
Ver arquivo `.github/workflows/deploy.yml`

### 7. Deploy Manual (alternativa)
```bash
cd backend
npm run build
zip -r deploy.zip dist/ package.json package-lock.json prisma/
az webapp deployment source config-zip \
  --resource-group rg-pelosolhosderha \
  --name pelosolhosderha \
  --src deploy.zip
```

---

## Neon Database Setup

### Production (main branch)
1. Crie um projeto em https://neon.tech
2. Copie a connection string para `DATABASE_URL`

### Homolog (branch)
1. No Neon console, crie uma branch chamada `homolog`
2. Copie a connection string da branch para o ambiente homolog

---

## Alternativa ainda mais barata: Azure Container Apps (Consumption)
- Paga apenas pelo uso real
- 2 milhões de requests/mês grátis
- 180.000 vCPU-seconds grátis/mês
- Ver `Dockerfile` para containerização
