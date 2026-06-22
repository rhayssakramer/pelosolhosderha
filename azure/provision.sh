#!/bin/bash
# Script para provisionar recursos Azure
# Uso: ./provision.sh [environment]
# Environments: homolog, production

ENV=${1:-production}
RESOURCE_GROUP="rg-pelosolhosderha"
LOCATION="brazilsouth"
PLAN_NAME="plan-pelosolhosderha"
STORAGE_ACCOUNT="stpelosolhosderha"
STORAGE_CONTAINER="uploads"

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
echo "   az webapp config appsettings set --name $APP_NAME --resource-group $RESOURCE_GROUP --settings NODE_ENV=$ENV DATABASE_URL=... JWT_SECRET=... AZURE_STORAGE_CONNECTION_STRING=..."

# ============================================================
# Azure Blob Storage (para imagens persistentes)
# ============================================================

echo ""
echo "📸 Criando Storage Account para uploads..."
az storage account create \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku Standard_LRS \
  --kind StorageV2 \
  --allow-blob-public-access true

echo "📁 Criando container '$STORAGE_CONTAINER'..."
az storage container create \
  --name $STORAGE_CONTAINER \
  --account-name $STORAGE_ACCOUNT \
  --public-access blob

# Obter connection string
CONN_STRING=$(az storage account show-connection-string \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --output tsv)

echo ""
echo "🔑 Connection String do Storage:"
echo "   $CONN_STRING"
echo ""
echo "   Configure no App Service:"
echo "   az webapp config appsettings set --name $APP_NAME --resource-group $RESOURCE_GROUP --settings AZURE_STORAGE_CONNECTION_STRING=\"$CONN_STRING\" AZURE_STORAGE_CONTAINER=$STORAGE_CONTAINER"
