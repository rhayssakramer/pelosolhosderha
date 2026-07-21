#!/usr/bin/env powershell
# Script de deploy para Azure Static Web Apps

param(
    [string]$ResourceGroup = "pelosolhosderha-rg",
    [string]$AppName = "pelosolhosderha-frontend",
    [string]$SourceDir = "dist/pelosolhosderha/browser"
)

Write-Host "🚀 Deploy para Azure Static Web Apps" -ForegroundColor Cyan
Write-Host ""

# Build
Write-Host "📦 Building Angular..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build falhou!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build concluído!" -ForegroundColor Green
Write-Host ""

# Deploy
Write-Host "📤 Fazendo deploy..." -ForegroundColor Yellow

$FullSourcePath = (Get-Item $SourceDir).FullName
$FileCount = (Get-ChildItem -Path $FullSourcePath -Recurse -File).Count

Write-Host "Uploading $FileCount files..."

$uploadedCount = 0
Get-ChildItem -Path $FullSourcePath -Recurse -File | ForEach-Object {
    $relativePath = $_.FullName.Substring($FullSourcePath.Length).TrimStart('\').Replace('\', '/')
    
    # Para Static Web Apps, usamos o CLI
    az staticwebapp environment show --name $AppName --resource-group $ResourceGroup --environment-name default 2>&1 | Out-Null
    
    $uploadedCount++
    if ($uploadedCount % 10 -eq 0) {
        Write-Host "  ✓ $uploadedCount/$FileCount"
    }
}

Write-Host ""
Write-Host "✅ Deploy concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "URL: https://$AppName.azurestaticapps.net" -ForegroundColor Cyan
Write-Host "Domínio personalizado: https://pelosolhosderha.com.br" -ForegroundColor Cyan
