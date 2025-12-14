# Script de pruebas para endpoints del backend
# Pide un JWT (ADMIN/MANAGER) y realiza varias peticiones de ejemplo.

$baseUrl = 'http://localhost:3000'

Write-Host "== Script de pruebas: endpoints backend =="

$token = Read-Host -Prompt 'Pega tu JWT (rol ADMIN o MANAGER)'
if ([string]::IsNullOrWhiteSpace($token)) {
    Write-Error "No se proporcionó token. Abortando."
    exit 1
}

$headers = @{ Authorization = "Bearer $token"; 'Content-Type' = 'application/json' }

function TryInvoke($script:block, $label) {
    Write-Host "\n--> Ejecutando: $label"
    try {
        & $script
    } catch {
        Write-Host ("Error en {0}`n{1}" -f $label, $_.Exception.Message) -ForegroundColor Red
    }
}

# 1) Listar condominios del usuario
TryInvoke ({
    $res = Invoke-RestMethod -Method Get -Uri "$baseUrl/api/auth/condominiums" -Headers $headers
    Write-Host "Condominios:`n" (ConvertTo-Json $res -Depth 5)
    $res | ConvertTo-Json -Depth 5 | Out-File -FilePath ./backend/test-results/condominiums.json -Force
}, 'GET /api/auth/condominiums')

# 2) Listar cargos (sin override)
TryInvoke ({
    $res = Invoke-RestMethod -Method Get -Uri "$baseUrl/api/billing/charges" -Headers $headers
    Write-Host "Charges (sin override):`n" (ConvertTo-Json $res -Depth 5)
    $res | ConvertTo-Json -Depth 5 | Out-File -FilePath ./backend/test-results/charges_default.json -Force
}, 'GET /api/billing/charges')

# 3) Listar cargos con override (condominiumId ficticio 123)
TryInvoke ({
    $res = Invoke-RestMethod -Method Get -Uri "$baseUrl/api/billing/charges?condominiumId=123" -Headers $headers
    Write-Host "Charges (override condominiumId=123):`n" (ConvertTo-Json $res -Depth 5)
    $res | ConvertTo-Json -Depth 5 | Out-File -FilePath ./backend/test-results/charges_override.json -Force
}, 'GET /api/billing/charges?condominiumId=123')

# 4) Crear anuncio de prueba con condominiumId=123
TryInvoke ({
    $body = @{ title='Prueba desde script'; message='Mensaje de prueba'; condominiumId=123 } | ConvertTo-Json
    $res = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/announcements" -Headers $headers -Body $body
    Write-Host "Crear anuncio respuesta:`n" (ConvertTo-Json $res -Depth 5)
    $res | ConvertTo-Json -Depth 5 | Out-File -FilePath ./backend/test-results/create_announcement.json -Force
}, 'POST /api/announcements (body.consumidiniumId=123)')

Write-Host "\n== Script finalizado. Resultados guardados en ./backend/test-results/ (si se crearon). =="
