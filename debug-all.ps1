Write-Host "--- Starting Debug & Health Checks ---" -ForegroundColor Cyan

# 1. Expo Doctor
Write-Host "`n[1/2] Running Expo Doctor..." -ForegroundColor Yellow
npx expo-doctor
if ($LASTEXITCODE -eq 0) {
    Write-Host "Check passed!" -ForegroundColor Green
} else {
    Write-Host "Check failed! Please review the output above." -ForegroundColor Red
}

# 2. TypeScript Type Check
Write-Host "`n[2/2] Running TypeScript Type Check..." -ForegroundColor Yellow
npx tsc --noEmit
if ($LASTEXITCODE -eq 0) {
    Write-Host "Check passed!" -ForegroundColor Green
} else {
    Write-Host "Check failed! Fix the type errors above." -ForegroundColor Red
}

Write-Host "`n--- Debug Checks Finished ---" -ForegroundColor Cyan
