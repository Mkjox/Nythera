Write-Host "--- Starting APK Creation Process ---" -ForegroundColor Cyan

if (-not (Test-Path "android")) {
    Write-Host "Error: 'android' directory not found. Please run 'npx expo prebuild' if you haven't yet." -ForegroundColor Red
    exit 1
}

Write-Host "Navigating to android folder..." -ForegroundColor Yellow
Push-Location android

Write-Host "Running ./gradlew assembleRelease..." -ForegroundColor Yellow
.\gradlew.bat assembleRelease

if ($LASTEXITCODE -eq 0) {
    Pop-Location
    Write-Host "`nBuild Successful!" -ForegroundColor Green
    
    $apkPath = Resolve-Path "android\app\build\outputs\apk\release\app-release.apk" -ErrorAction SilentlyContinue
    if ($apkPath) {
        Write-Host "APK Location: $apkPath" -ForegroundColor Cyan
    } else {
        # Check if it's named differently (e.g. if the package name affects output folder or filename)
        $altPath = Get-ChildItem -Path "android\app\build\outputs\apk\release\*.apk" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName -First 1
        if ($altPath) {
             Write-Host "APK Location: $altPath" -ForegroundColor Cyan
        } else {
             Write-Host "Warning: Could not find the APK file in 'android\app\build\outputs\apk\release\'. Please check that folder manually." -ForegroundColor Yellow
        }
    }
} else {
    Pop-Location
    Write-Host "`nBuild Failed! Please check the logs above for details." -ForegroundColor Red
    exit 1
}

Write-Host "`n--- Process Finished ---" -ForegroundColor Cyan
