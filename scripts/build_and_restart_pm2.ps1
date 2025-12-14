# Build frontend and restart PM2 processes (fixed path handling)
Set-StrictMode -Version Latest

# Determine repository root reliably regardless of current working directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$repoRoot = (Resolve-Path (Join-Path $scriptDir '..')).ProviderPath
Write-Output "Repo root: $repoRoot"

Push-Location $repoRoot

Write-Output "Building frontend..."
Push-Location (Join-Path $repoRoot 'frontend')
npm install --no-audit --no-fund
npm run build
Pop-Location

Write-Output "Restarting PM2 processes via ecosystem.config.js"
$ecos = Join-Path $repoRoot 'ecosystem.config.js'
if (Test-Path $ecos) {
	pm2 stop $ecos 2>$null | Out-Null
	pm2 start $ecos --update-env
	pm2 save
} else {
	Write-Output "ecosystem.config.js not found at $ecos"
}

Write-Output "Done. Use 'pm2 ls' to check status." 
Pop-Location
