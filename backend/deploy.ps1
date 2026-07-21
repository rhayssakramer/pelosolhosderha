#!/usr/bin/env powershell
# Script para fazer deploy do backend para Azure Container Apps
# Requer: Docker Desktop ou Docker CLI

param(
    [string]$ImageTag = "v6",
    [string]$RegistryName = "pelosolhosderhaacr",
    [string]$RepositoryName = "pelosolhosderha-api",
    [string]$ResourceGroup = "rg-pelosolhosderha",
    [string]$ContainerAppName = "pelosolhosderha-api"
)

Write-Host "🚀 Deploy do Backend para Azure Container Apps" -ForegroundColor Cyan
Write-Host ""

# Step 1: Verificar Docker
Write-Host "🐳 Verificando Docker..." -ForegroundColor Yellow
$dockerVersion = docker --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker não está instalado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📥 Instale o Docker Desktop:"
    Write-Host "   https://www.docker.com/products/docker-desktop"
    exit 1
}
Write-Host "✅ Docker $dockerVersion" -ForegroundColor Green
Write-Host ""

# Step 2: Login no Azure Container Registry
Write-Host "🔐 Fazendo login no Azure Container Registry..." -ForegroundColor Yellow
az acr login --name $RegistryName
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Falha ao fazer login no ACR!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Login bem-sucedido!" -ForegroundColor Green
Write-Host ""

# Step 3: Build da imagem Docker
Write-Host "📦 Fazendo build da imagem Docker..." -ForegroundColor Yellow
$FullImageName = "$RegistryName.azurecr.io/$RepositoryName`:$ImageTag"
docker build -t $FullImageName --build-arg NODE_ENV=production ./backend
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Falha no build da imagem!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build concluído: $FullImageName" -ForegroundColor Green
Write-Host ""

# Step 4: Push para Azure Container Registry
Write-Host "📤 Fazendo push da imagem para ACR..." -ForegroundColor Yellow
docker push $FullImageName
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Falha ao fazer push!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Push concluído!" -ForegroundColor Green
Write-Host ""

# Step 5: Atualizar Container App
Write-Host "🔄 Atualizando Container App..." -ForegroundColor Yellow
az containerapp update `
    --name $ContainerAppName `
    --resource-group $ResourceGroup `
    --image $FullImageName
    
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Falha ao atualizar Container App!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Container App atualizado!" -ForegroundColor Green
Write-Host ""

# Step 6: Aguardar atualização
Write-Host "⏳ Aguardando replicação (este pode levar 1-2 minutos)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Step 7: Verificar saúde
Write-Host "🏥 Verificando saúde da API..." -ForegroundColor Yellow
$maxRetries = 30
$retryCount = 0
$healthy = $false

while ($retryCount -lt $maxRetries) {
    try {
        $response = Invoke-WebRequest -Uri "https://pelosolhosderha-api.bluesea-ecfbf889.brazilsouth.azurecontainerapps.io/api/health" -UseBasicParsing -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $healthy = $true
            break
        }
    }
    catch {
        # Não faz nada, tenta novamente
    }
    
    Write-Host "  Tentativa $($retryCount + 1)/$maxRetries..." -NoNewline
    Start-Sleep -Seconds 2
    Write-Host " ✓" -ForegroundColor Green
    $retryCount++
}

Write-Host ""
if ($healthy) {
    Write-Host "✅ Deploy concluído com sucesso! API está saudável!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Informações do Deploy:" -ForegroundColor Cyan
    Write-Host "  Imagem: $FullImageName"
    Write-Host "  Container App: $ContainerAppName"
    Write-Host "  Resource Group: $ResourceGroup"
    Write-Host ""
    Write-Host "🔗 Teste a API:" -ForegroundColor Cyan
    Write-Host "  https://pelosolhosderha-api.bluesea-ecfbf889.brazilsouth.azurecontainerapps.io/api/health"
} else {
    Write-Host "⚠️  API não respondeu após $maxRetries tentativas" -ForegroundColor Yellow
    Write-Host "    Verifique os logs:"
    Write-Host "    az containerapp logs show --name $ContainerAppName --resource-group $ResourceGroup"
}
