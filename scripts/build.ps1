$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
Push-Location $root
try {
  docker compose build --no-cache --progress=plain
} finally {
  Pop-Location
}
