# Android Build Guide for FinTrack Pro

This guide explains how to build and install the FinTrack Pro Android app on your phone.

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js and npm** (already installed if you've been developing the web app)
2. **Android Studio** - Download from https://developer.android.com/studio
3. **Java Development Kit (JDK)** - Android Studio includes this, or download from https://www.oracle.com/java/technologies/downloads/

## Initial Setup (One-Time Only)

The Android platform has already been initialized for this project. If you're setting up on a new machine, you may need to:

1. Install all dependencies:
```bash
npm install
```

2. Build the web app and sync to Android:
```bash
npm run cap:sync
```

## Building the Android App

### Step 1: Build the Web App

First, build your React web app:

```bash
npm run build
```

This creates the production-ready web assets in the `dist` folder.

### Step 2: Sync to Android

Sync the web assets to the Android project:

```bash
npx cap sync
```

Or use the combined command:

```bash
npm run cap:sync
```

### Step 3: Open in Android Studio

Open the Android project in Android Studio:

```bash
npx cap open android
```

Or use:

```bash
npm run cap:open
```

This will launch Android Studio with your Android project.

### Step 4: Build APK in Android Studio

Once Android Studio opens:

1. **Wait for Gradle sync to complete** - This may take a few minutes the first time
2. **Build the APK**:
   - Go to `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
   - Wait for the build to complete
   - A notification will appear with a link to locate the APK

3. **Locate the APK**:
   - The APK will be in: `android/app/build/outputs/apk/debug/app-debug.apk`
   - Click "locate" in the notification to open the folder

### Step 5: Install APK on Your Phone

#### Option A: USB Cable
1. Enable "Developer Options" and "USB Debugging" on your Android phone
2. Connect your phone to your computer via USB
3. Copy the APK file to your phone
4. On your phone, open the APK file and install it
5. You may need to enable "Install from Unknown Sources" for this app

#### Option B: File Transfer
1. Copy the APK file (`app-debug.apk`) to your phone using:
   - Google Drive
   - Email
   - Bluetooth
   - USB file transfer
2. On your phone, open the APK file and install it
3. You may need to enable "Install from Unknown Sources"

#### Option C: Direct Install from Android Studio
1. Connect your phone via USB with USB Debugging enabled
2. In Android Studio, click the "Run" button (green play icon)
3. Select your phone from the device list
4. The app will be automatically installed and launched

## Creating a Release (Signed) APK

For production use, you should create a signed release APK:

### Step 1: Generate a Keystore

```bash
keytool -genkey -v -keystore fintrack-release-key.keystore -alias fintrack -keyalg RSA -keysize 2048 -validity 10000
```

Follow the prompts to set a password and enter your details.

### Step 2: Configure Signing

1. Place the keystore file in a secure location (e.g., `android/app/`)
2. Update `capacitor.config.json` with keystore details:

```json
"android": {
  "buildOptions": {
    "keystorePath": "fintrack-release-key.keystore",
    "keystoreAlias": "fintrack"
  }
}
```

3. In Android Studio, go to `Build` → `Generate Signed Bundle / APK`
4. Select `APK`
5. Choose your keystore file and enter the password
6. Select "release" build variant
7. Build the APK

The signed APK will be in: `android/app/release/app-release.apk`

## Export/Import Data Feature

The app includes data backup and restore functionality:

### Exporting Data:
1. Open the app
2. Go to "Settings"
3. Scroll to "Data Management" section
4. Click "Export Data"
5. The backup ZIP file will be saved to your device's Documents folder
6. File name format: `fintrack_backup_YYYY-MM-DD.zip`

### Importing Data:
1. Open the app
2. Go to "Settings"
3. Scroll to "Data Management" section
4. Click "Import Data"
5. Select your backup ZIP file
6. Confirm the import (this will replace all existing data)
7. The app will reload automatically

### Backup File Contents:
Each backup ZIP contains:
- `entries.json` - All expenses and credits
- `invoices.json` - All invoices
- `clients.json` - All client names
- `settings.json` - Organization settings

## Useful NPM Scripts

- `npm run dev` - Start development server
- `npm run build` - Build the web app
- `npm run cap:sync` - Build and sync to Android
- `npm run cap:open` - Open Android Studio
- `npm run build:android` - Full build and open in Android Studio

## Troubleshooting

### Gradle Build Failed
- Ensure you have a stable internet connection (Gradle downloads dependencies)
- In Android Studio, try `File` → `Invalidate Caches / Restart`

### APK Installation Blocked
- Enable "Install from Unknown Sources" in your phone's security settings
- The exact location varies by Android version and manufacturer

### App Crashes on Startup
- Clear app data: Settings → Apps → FinTrack Pro → Clear Data
- Reinstall the app

### Export/Import Not Working
- Check that the app has storage permissions
- On Android 11+, the app should automatically request necessary permissions

### Changes Not Showing in App
- Make sure to run `npm run build` before `npx cap sync`
- Completely uninstall the old APK before installing a new one

## App Permissions

The app requires the following permissions:
- **Internet** - For potential future features (currently works offline)
- **Read/Write Storage** - For exporting and importing backup files
- **Read Media** - For Android 13+ compatibility

## Support

For issues or questions:
1. Check the console logs in Android Studio's Logcat
2. Verify the web app works correctly in a browser first
3. Ensure all npm packages are installed correctly

## Version Information

- App Version: 0.0.0
- App ID: com.fintrackpro.app
- Build Tool: Capacitor + Vite
- Min Android Version: API 22 (Android 5.1)
- Target Android Version: API 34 (Android 14)

