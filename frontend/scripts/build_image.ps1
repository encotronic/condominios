param(
  [string]$Tag = "condominios-frontend:latest"
)

Write-Host "Building frontend Docker image with tag: $Tag"
docker build -t $Tag -f Dockerfile .
if ($LASTEXITCODE -ne 0) {
  Write-Error "Docker build failed with exit code $LASTEXITCODE"
  exit $LASTEXITCODE
}
Write-Host "Built image: $Tag"
