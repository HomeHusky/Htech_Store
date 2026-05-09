# Dev setup and run script for backend (Windows PowerShell)
# Usage: Open PowerShell, navigate to backend, then: .\run_dev_backend.ps1

$ErrorActionPreference = "Stop"
Write-Host "1) Ensure virtualenv is created"
if (-not (Test-Path ".venv/Scripts/python.exe")) {
    Write-Host "Creating virtualenv..."
    python -m venv .venv
}

$python = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"
if (-not (Test-Path $python)) {
    Write-Error "Python in virtualenv not found: $python"
    Exit 1
}

Write-Host "2) Installing requirements (may take a while)"
if (Test-Path "requirements.txt") {
    & $python -m pip install -r requirements.txt
}

Write-Host "3) Running alembic migrations"
# Ensure alembic uses this script directory as working dir and PYTHONPATH
Push-Location $PSScriptRoot
$env:PYTHONPATH = $PSScriptRoot
& $python -m alembic upgrade head
Pop-Location

Write-Host "4) Seeding Htech demo data (dev only)"
Push-Location $PSScriptRoot
if (Test-Path "seed_htech.py") {
    & $python seed_htech.py
} else {
    Write-Host "seed_htech.py not found"
}
Pop-Location

Write-Host "5) Starting backend (uvicorn)"
Push-Location $PSScriptRoot
& $python -m uvicorn app.main:app --reload --port 8000
Pop-Location
