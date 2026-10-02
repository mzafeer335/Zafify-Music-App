# 🎵 Zafify - Premium Ad-Free Music Streaming App

<p align="center">
  <img src="./assets/icon.png" width="120" height="120" alt="Zafify Logo" style="border-radius: 24px;" />
</p>

<p align="center">
  <b>A lightweight, high-performance, Spotify-inspired music streaming application built for Android.</b><br />
  Stream trending global hits, browse curated cultural genres, download MP3s for offline playback, and enjoy background playback without ads or paywalls.
</p>

## 📥 Download Standalone APK

Get the latest Android build directly on your device:

[![Download APK](https://img.shields.io/badge/Download-Zafify_v1.0.0_APK-1DB954?style=for-the-badge&logo=android&logoColor=white)](https://expo.dev/accounts/mzafeer335/projects/zafify/builds/c3561da8-c2dc-4fd6-a971-3d846489c04c)

Direct Build Link: [Expo EAS Build Artifact](https://expo.dev/accounts/mzafeer335/projects/zafify/builds/c3561da8-c2dc-4fd6-a971-3d846489c04c)

> **Installation Note**:
>
> 1. Open the link on your Android phone and download the `.apk` file.
> 2. When opening the file, tap **Settings** ➔ toggle **Allow from this source** (or tap **Install Anyway** if prompted about unknown apps).
> 3. Enjoy ad-free streaming and offline playback!

---

## 📱 Highlights & Features

- **🎧 Seamless Streaming & Fast Discovery:**
  - Integrated with decentralized Audius API gateways using automatic multi-node fallback to guarantee high uptime and zero downtime.
  - Curated genre feeds including _Top 50 Global_, _Bollywood Hits_, _Punjabi Hot 20_, _Hindi Romantic_, _Urdu Ghazal_, _Sufi & Qawwali_, _Midnight Lo-Fi_, and _Desi Hip-Hop_.
  - Real-time instant search bar for artists, tracks, and custom queries.

- **💾 True Offline Download Engine:**
  - One-tap MP3 download straight to physical device storage using `expo-file-system/legacy`.
  - Dedicated **Offline Downloads** vault inside "Your Library" enabling full audio playback with Wi-Fi and mobile data completely disabled.

- **✨ Spotify-Grade Audio Player Experience:**
  - **Persistent Mini-Player**: Floating mini-pill with track artwork, interactive play/pause, pulsing active playback indicator, and a real-time progress underline.
  - **Full-Screen Modal Player**: Interactive scrub bar, track duration stamps, like/heart shortcuts, and swipe-down-to-dismiss gesture handling.
  - **Queue Logic**: Shuffle mode, Loop Current Track, and Continuous Queue Repeat.

- **⚡ Native Android Optimization:**
  - Built with modern `expo-audio` configured with foreground media playback services and `WAKE_LOCK` permissions.
  - Persistent background playback that keeps music rolling when the screen is locked or while multitasking in other apps.
  - Compiled to a standalone, production-ready `.apk` via EAS Build.

- **💾 Persistent State:**
  - Local state persistence for Liked Songs and Downloaded Tracks using `@react-native-async-storage/async-storage`.

---

## 🛠️ Tech Stack & Architecture

| Layer                             | Technology                                                                                |
| --------------------------------- | ----------------------------------------------------------------------------------------- |
| **Framework**                     | [React Native](https://reactnative.dev/) (React 19) with [Expo SDK 57](https://expo.dev/) |
| **Language**                      | [TypeScript](https://www.typescriptlang.org/)                                             |
| **Audio Playback**                | `expo-audio`                                                                              |
| **Local Storage & Offline Files** | `expo-file-system/legacy` & `@react-native-async-storage/async-storage`                   |
| **UI Components & Icons**         | `@expo/vector-icons` (Ionicons), `@react-native-community/slider`                         |
| **Gestures & Animations**         | `react-native-gesture-handler`, `react-native-reanimated`, `Animated` PanResponder        |
| **Cloud Build & Distribution**    | EAS (Expo Application Services) Build                                                     |

---

## 📂 Project Structure

```text
Zafify/
├── assets/                  # App icons, splash screens, and image assets
├── src/
│   ├── components/
│   │   ├── FullPlayerModal.tsx   # Gesture-dismissible full player modal with scrubber
│   │   ├── MiniPlayer.tsx        # Floating mini-player above navigation
│   │   └── TrackItem.tsx         # Track row component with direct download & like actions
│   ├── context/
│   │   └── MusicContext.tsx      # Global audio engine, queue manager, and storage state
│   └── screens/
│       └── HomeScreen.tsx        # Main screen containing Search, Genre Pills, and Library
├── app.json                 # Expo native configuration, permissions, and package IDs
├── eas.json                 # EAS build profiles configured for standalone APK output
├── package.json             # Dependencies and build lifecycle hooks
└── tsconfig.json            # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or newer recommended)
- **Git**
- **Expo Go** app installed on your Android device (or an Android emulator)

### 1. Clone the Repository

````bash
git clone [https://github.com/](https://github.com/)<YOUR-GITHUB-USERNAME>/zafify.git
cd zafify

### 2. Install Dependencies
```bash
npm install

### 3. Start Development Server
```bash
npx expo start -c

Scan the generated QR code in your terminal using the Expo Go app on your Android phone.

## 📦 Compiling Standalone Android APK

### 1. Install EAS CLI and Log In
```bash
npm install -g eas-cli
eas login

### 2. Build the APK
```bash
eas build -p android --profile preview

### 3. Install on Device
Download the compiled .apk from the provided EAS terminal link or scan the build QR code directly on your phone.


## 📜 License
This project is open-source and available under the MIT License.
````
