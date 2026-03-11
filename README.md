# Techmeme Reader

An unofficial Android app for reading [Techmeme](https://www.techmeme.com) — the tech news aggregator. Browse headlines, read articles in a clean reader view, save stories for later.

Not affiliated with Techmeme Inc.

## What it does

- Pulls headlines from all five Techmeme sections: Top News, Newest, More News, River, and Events
- Shows multi-source articles/headlines.
- Browser article to local text in app when possible.

## Build APK

Requires Node.js and an [Expo](https://expo.dev) account (free tier or otherwise).

```bash
npm install
npx eas login
npx eas build --profile preview --platform android
```

The `preview` profile produces a standalone APK. Download it from the EAS dashboard and install on your device.

For development builds with hot reload:

```bash
npx eas build --profile development --platform android
npx expo start --dev-client
```

## Dependencies

| Package | Purpose |
|---|---|
| expo ~52.0 | Framework (managed workflow) |
| react-native 0.76 | Runtime |
| react-native-webview | In-app browser + Readability extraction |
| @react-navigation/drawer + stack | Navigation |
| zustand | State management |
| @react-native-async-storage/async-storage | Persistence |
| axios | HTTP |
| node-html-parser | Techmeme HTML parsing |
| @mozilla/readability | Article text extraction |

## Version

0.1.0 — initial build, Android only.

## License

This is free and unencumbered software released into the public domain. Do whatever you want with it.
