# Money Stack Tracker

A minimalist React Native app for tracking money across multiple categories with real-time EUR/RSD conversion using National Bank of Serbia exchange rates.

## Features

- Add/delete money categories (Cash, Savings, Investments, etc.)
- Per-category operations: add/subtract money with optional notes
- Live EUR conversion using NBS API
- MMKV local storage for instant data persistence
- Dark mode UI only
- No splash screen for instant app launch
- Optimized for speed and performance

## Tech Stack

- React Native (no Expo)
- react-native-mmkv for storage
- @react-navigation/native for navigation
- TypeScript
- National Bank of Serbia API for exchange rates

## Installation

1. Install dependencies:
```bash
npm install
```

2. For Android:
```bash
npm run android
```

## Project Structure

```
/src
  /components
    - CategoryCard.tsx         # Category display with balance
    - AddMoneyModal.tsx        # Modal for add/subtract operations
    - CurrencyConverter.tsx    # EUR conversion display
  /screens
    - HomeScreen.tsx           # Main screen with category list
    - AddCategoryScreen.tsx    # Create new category
  /services
    - StorageService.ts        # MMKV wrapper
    - CurrencyService.ts       # NBS API integration
  /types
    - index.ts                 # TypeScript types
  /theme
    - colors.ts                # Dark mode theme
```

## Usage

### Create a Category
1. Tap the + button on the home screen
2. Enter category name (e.g., "Cash", "Savings")
3. Optionally set an initial balance
4. Tap "Create Category"

### Add/Subtract Money
1. On a category card, tap "+ Add" or "- Subtract"
2. Enter the amount in RSD
3. Optionally add a note
4. Tap "Add" or "Subtract"

### View EUR Equivalent
1. Tap "Show EUR" on any category card
2. The app fetches the current exchange rate from NBS
3. EUR equivalent is displayed with the current rate

### Delete a Category
1. Long press on a category card
2. Confirm deletion

## Data Storage

All data is stored locally using MMKV:
- Categories: `categories` key (JSON array)
- Exchange rate: `eur_rate` key (cached for 1 hour)
- No backend required
- All operations are instant

## Exchange Rate API

- Source: National Bank of Serbia (https://nbs.rs/kursnaListaModul/srednjiKurs.json)
- Rate is cached for 1 hour
- Automatic fallback to cached rate if offline
- Background updates

## Performance Optimizations

- React.memo for component optimization
- FlatList with lazy loading
- Debounced API calls
- Minimal re-renders
- No splash screen delay

## Building for Production

### Android
```bash
cd android
./gradlew assembleRelease
```

The APK will be at: `android/app/build/outputs/apk/release/app-release.apk`
