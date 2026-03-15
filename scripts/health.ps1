$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
Push-Location $root
try {
  Write-Host "GET http://localhost"
  curl.exe -fsS http://localhost | Out-Null
  Write-Host "OK"

  Write-Host "GET http://localhost:8000/api/v1/health"
  curl.exe -fsS http://localhost:8000/api/v1/health

  Write-Host "GET http://localhost/minihome/testuser"
  curl.exe -fsS http://localhost/minihome/testuser | Out-Null
  Write-Host "OK"
} finally {
  Pop-Location
}
