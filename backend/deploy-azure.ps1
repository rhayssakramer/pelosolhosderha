#!/usr/bin/env powershell
# Script para fazer deploy via Azure Container Registry Tasks
# Nao requer Docker Desktop instalado localmente!

param(
    [string]$ImageTag = "v6",
    [string]$RegistryName = "pelosolhosderhaacr",
    [string]$RepositoryName = "pelosolhosderha-api",
    [string]$ResourceGroup = "rg-pelosolhosderha",
    [string]$ContainerAppName = "pelosolhosderha-api"
)

Write-Host "Iniciando deploy do Backend via Azure Container Registry Tasks" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build via ACR Tasks
Write-Host "Iniciando build na nuvem via Azure Container Registry..." -ForegroundColor Yellow
$FullImageName = "$RegistryName.azurecr.io/$RepositoryName`:$ImageTag"

az acr build `
    --registry $RegistryName `
    --image $FullImageName `
    --file backend/Dockerfile `
    ./backend

if ($LASTEXITCODE -ne 0) {
    Write-Host "Falha no build!" -ForegroundColor Red
    exit 1
}

Write-Host "Build concluido na nuvem!" -ForegroundColor Green
Write-Host ""

# Step 2: Atualizar Container App
Write-Host "Atualizando Container App..." -ForegroundColor Yellow
az containerapp update `
    --name $ContainerAppName `
    --resource-group $ResourceGroup `
    --image $FullImageName

if ($LASTEXITCODE -ne 0) {
    Write-Host "Falha ao atualizar Container App!" -ForegroundColor Red
    exit 1
}

Write-Host "Container App atualizado!" -ForegroundColor Green
Write-Host ""

Write-Host "Deploy completado!" -ForegroundColor Green
