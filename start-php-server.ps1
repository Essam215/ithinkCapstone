Write-Host "Starting PHP Backend Server..." -ForegroundColor Green
Write-Host ""
Write-Host "Make sure you have:" -ForegroundColor Yellow
Write-Host "1. PHP installed and in your PATH"
Write-Host "2. MySQL running"
Write-Host "3. Database 'peer_helpers_program' created"
Write-Host "4. Tables imported from database/schema.sql"
Write-Host ""

# Check if PHP is available
$phpCheck = Get-Command php -ErrorAction SilentlyContinue
if (-not $phpCheck) {
    Write-Host "ERROR: PHP is not found in your PATH!" -ForegroundColor Red
    Write-Host "Please install PHP or add it to your PATH" -ForegroundColor Red
    pause
    exit
}

Write-Host "PHP found: $($phpCheck.Source)" -ForegroundColor Green
Write-Host "Starting server on http://localhost:8000" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

Set-Location api
Write-Host "Server will be available at: http://localhost:8000" -ForegroundColor Cyan
Write-Host ""
php -S localhost:8000 router.php

