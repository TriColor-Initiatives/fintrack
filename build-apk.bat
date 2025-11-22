@echo off
echo Building FinTrack Pro APK...
echo.

echo [1/4] Building web app...
call npm run build
if errorlevel 1 goto error

echo.
echo [2/4] Syncing to Android...
call npx cap sync
if errorlevel 1 goto error

echo.
echo [3/4] Building APK with Gradle...
cd android
call gradlew.bat assembleDebug
if errorlevel 1 goto error
cd ..

echo.
echo [4/4] Success!
echo.
echo ========================================
echo APK built successfully!
echo Location: android\app\build\outputs\apk\debug\app-debug.apk
echo ========================================
echo.
pause
exit /b 0

:error
echo.
echo ========================================
echo Build failed! Check the errors above.
echo ========================================
pause
exit /b 1

