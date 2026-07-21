#!/usr/bin/env powershell
# Script de deploy manual para Azure Static Web Apps
# Use este script quando quiser fazer deploy da aplicação para o Azure

param(
    [string]$DeploymentToken = "6ba2204b005068a2c4db070d96a3b1fccb94905af71117538bdecf999225b92907-99d030b7-a8aa-4a86-97df-4f2ba7931eb800f31140fe04e90f"
)

Write-Host "🚀 Deploy Manual para Azure Static Web Apps" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build
Write-Host "📦 Building Angular..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build falhou!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build concluído!" -ForegroundColor Green
Write-Host ""

# Step 2: Copiar arquivo de configuração
Write-Host "📋 Copiando arquivo de configuração..." -ForegroundColor Yellow
Copy-Item "./staticwebapp.config.json" -Destination "./dist/pelosolhosderha/browser/staticwebapp.config.json" -Force

# Step 3: Deploy para Produção
Write-Host "📤 Fazendo deploy para Produção..." -ForegroundColor Yellow

swa deploy `
    --deployment-token $DeploymentToken `
    --app-location "./dist/pelosolhosderha/browser" `
    --env production

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Deploy para produção falhou!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Deploy para produção concluído!" -ForegroundColor Green
Write-Host ""

# Step 4: Deploy para Preview
Write-Host "📤 Fazendo deploy para Preview..." -ForegroundColor Yellow

swa deploy `
    --deployment-token $DeploymentToken `
    --app-location "./dist/pelosolhosderha/browser" `
    --env preview

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Todos os deploys concluídos com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "URL de preview: https://zealous-field-0fe04e90f-preview.eastus2.7.azurestaticapps.net" -ForegroundColor Cyan
    Write-Host "URL de produção: https://zealous-field-0fe04e90f.7.azurestaticapps.net" -ForegroundColor Cyan
    Write-Host "Domínio customizado: https://pelosolhosderha.com.br" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Deploy para preview falhou!" -ForegroundColor Red
    exit 1
}
