# Windows wrapper for the Supabase keepalive script.
# Use this from Task Scheduler every 5 days.

$ErrorActionPreference = "Stop"

$python = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"
if (-not (Test-Path $python)) {
    $python = "python"
}

Push-Location $PSScriptRoot
try {
    & $python keep_supabase_alive.py
} finally {
    Pop-Location
}