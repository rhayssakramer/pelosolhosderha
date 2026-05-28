#!/bin/bash
# Script para provisionar recursos Azure
# Uso: ./provision.sh [environment]
# Environments: homolog, production

ENV=${1:-production}
RESOURCE_GROUP="rg-pelosolhosderha"
LOCATION="brazilsouth"
PLAN_NAME="plan-pelosolhosderha"

if [ "$ENV" == "production" ]; then
  APP_NAME="pelosolhosderha"
elif [ "$ENV" == "homolog" ]; then
  APP_NAME="pelosolhosderha-homolog"
else
  echo "Environment inválido. Use: homolog ou production"
  exit 1
fi

echo "🚀 Provisionando ambiente: $ENV"
echo "   App: $APP_NAME"
echo "   Resource Group: $RESOURCE_GROUP"
echo "   Location: $LOCATION"

# Criar Resource Group
echo "📦 Criando Resource Group..."
az group create --name $RESOURCE_GROUP --location $LOCATION

# Criar App Service Plan (Free tier)
echo "📋 Criando App Service Plan (F1 - Free)..."
az appservice plan create \
  --name $PLAN_NAME \
  --resource-group $RESOURCE_GROUP \
  --sku F1 \
  --is-linux

# Criar Web App
echo "🌐 Criando Web App..."
az webapp create \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --plan $PLAN_NAME \
  --runtime "NODE:20-lts"

# Configurar startup command
az webapp config set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --startup-file "node dist/index.js"

echo "✅ Provisionamento concluído!"
echo "   URL: https://$APP_NAME.azurewebsites.net"
echo ""
echo "⚠️  Lembre-se de configurar as variáveis de ambiente:"
echo "   az webapp config appsettings set --name $APP_NAME --resource-group $RESOURCE_GROUP --settings NODE_ENV=$ENV DATABASE_URL=... JWT_SECRET=..."
