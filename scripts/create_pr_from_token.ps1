# Script para crear un PR leyendo un PAT desde 1docs/1token_git.md
# Ejecutar localmente desde la raíz del repo. No compartir el token.

$tokenPath = "1docs/1token_git.md"
if (-not (Test-Path $tokenPath)) {
  Write-Error "Token file not found at $tokenPath"
  exit 1
}

$token = (Get-Content -Raw $tokenPath).Trim()
if ([string]::IsNullOrWhiteSpace($token)) {
  Write-Error "Token file is empty"
  exit 1
}

$body = @{ 
  title = 'feat(multi-tenant): añadir workflow CI para migraciones y docs de migración'
  head  = 'feat/multi-condo-tests'
  base  = 'main'
  body  = "Resumen: Añade workflow CI que levanta Postgres, crea la extensión pgcrypto, ejecuta migraciones y corre tests backend.`n`nCambios principales:`n- backend/.github/workflows/ci-db-tests.yml`n- backend/MIGRATIONS.md`n- backend/.gitignore (node_modules removido del índice)."
} | ConvertTo-Json -Compress

$headers = @{
  Authorization = "token $token"
  Accept = 'application/vnd.github+json'
  'User-Agent' = 'create-pr-script'
}

try {
  $resp = Invoke-RestMethod -Uri 'https://api.github.com/repos/encotronic/condominios/pulls' -Method Post -Headers $headers -Body $body -ContentType 'application/json'
  if ($resp.html_url) {
    Write-Host "PR creada: $($resp.html_url)"
  } else {
    Write-Host "Respuesta inesperada de la API:"; $resp | Format-List
  }
} catch {
  Write-Error "Falló la creación del PR: $($_.Exception.Message)"
  if ($_.Exception.Response -and $_.Exception.Response.Content) {
    $err = ($_ | Select-Object -ExpandProperty Exception).Response.Content | ConvertFrom-Json -ErrorAction SilentlyContinue
    if ($err) { $err | Format-List }
  }
  exit 1
}
