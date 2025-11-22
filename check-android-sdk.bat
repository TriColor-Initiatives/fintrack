@echo off
echo Checking for Android SDK...
echo.

set SDK_PATH1=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
set SDK_PATH2=C:\Android\Sdk
set SDK_PATH3=C:\Program Files\Android\Sdk

if exist "%SDK_PATH1%" (
    echo [FOUND] Android SDK at: %SDK_PATH1%
    echo.
    echo Updating local.properties...
    echo sdk.dir=%SDK_PATH1:\=\\% > android\local.properties
    echo Done! You can now run: npm run build:apk
    pause
    exit /b 0
)

if exist "%SDK_PATH2%" (
    echo [FOUND] Android SDK at: %SDK_PATH2%
    echo.
    echo Updating local.properties...
    echo sdk.dir=%SDK_PATH2:\=\\% > android\local.properties
    echo Done! You can now run: npm run build:apk
    pause
    exit /b 0
)

if exist "%SDK_PATH3%" (
    echo [FOUND] Android SDK at: %SDK_PATH3%
    echo.
    echo Updating local.properties...
    echo sdk.dir=%SDK_PATH3:\=\\% > android\local.properties
    echo Done! You can now run: npm run build:apk
    pause
    exit /b 0
)

echo [NOT FOUND] Android SDK not found in common locations:
echo   - %SDK_PATH1%
echo   - %SDK_PATH2%
echo   - %SDK_PATH3%
echo.
echo Please install Android Studio from:
echo https://developer.android.com/studio
echo.
echo After installation, run this script again.
pause
exit /b 1

