# Budgetory

> Your Personal Finance Companion: Smart, Simple, Secure

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

Budgetory is a modern, cross-platform mobile application built with React Native and Expo, designed to help users manage their personal finances effectively. With its intuitive interface and powerful features, it makes tracking expenses and managing budgets a seamless experience.

## Features 

- **Smart Transaction Management**
  - Easy-to-use transaction logging system
  - Support for both income and expenses
  - Customizable transaction categories
  - Transaction history with detailed views

- **Financial Overview**
  - Real-time balance tracking
  - Income vs. Expense visualization
  - Category-wise expense breakdown
  - Summary cards for quick insights

- **Multi-currency Support**
  - Handle transactions in different currencies
  - Real-time currency conversion
  - Exchange rate updates

- **Data Management**
  - Secure local storage using AsyncStorage
  - Data persistence across sessions
  - Easy data backup and recovery

## Technology Stack 

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **UI/Styling**: 
  - NativeWind (TailwindCSS for React Native)
  - React Native Reanimated for animations
- **Navigation**: React Navigation v7
- **State Management**: React Context API
- **Storage**: AsyncStorage
- **Icons**: Expo Vector Icons

## Getting Started 

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS) or Android Emulator (for Android)

### Installation

1. Clone the repository
```bash
git clone https://github.com/ugurcaneser/Budgetory.git
cd Budgetory
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm start
```

4. Run on your preferred platform
```bash
# For iOS
npm run ios

# For Android
npm run android
```

## Project Structure

```
budgetory/
├── components/          # Reusable UI components
├── screens/            # Application screens
├── context/            # React Context providers
├── utils/             # Helper functions and utilities
├── types/             # TypeScript type definitions
└── assets/            # Images and other static assets
```

## License 

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Feel free to submit issues and pull requests.