param(
  [string]$Tag = "condominios-backend:latest"
)

Write-Host "Building Docker image with tag: $Tag"
docker build -t $Tag -f Dockerfile .
if ($LASTEXITCODE -ne 0) {
  Write-Error "Docker build failed with exit code $LASTEXITCODE"
  exit $LASTEXITCODE
}
Write-Host "Built image: $Tag"
