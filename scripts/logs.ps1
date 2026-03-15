$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
Push-Location $root
try {
  docker compose logs -f --tail=200
} finally {
  Pop-Location
}
