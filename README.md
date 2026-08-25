# 🔐 Secure Passphrase Generator

A **zero-data-storage**, client-side passphrase generator built with vanilla HTML, CSS, and JavaScript. Deployed to Firebase Hosting for fast, secure, and private access.

## 💡 Why This Exists

Most password generators are either not customizable enough or store data on servers. This tool is built for users who need:

- **Complete privacy**: No data is ever sent to a server. Everything runs in your browser.
- **Full customization**: Build passphrases with custom segments (words, numbers, symbols), length ranges, separators, and capitalization styles.
- **Lightweight & fast**: Vanilla JS ensures minimal load times and maximum performance.

## 🎯 Use Case

Designed for **mass on-boarding and off-boarding** scenarios, such as:

- Creating temporary credentials for new hires or clients
- Generating secure one-time access codes
- Bulk provisioning of accounts

## ✨ Key Features

- 🔐 **Cryptographically Secure**: Uses `window.crypto.getRandomValues()` with bias-free rejection sampling
- 🎨 **Customizable Segments**: Add, remove, and configure each part of your passphrase
- 📏 **Min/Max Length Control**: Set ranges for each segment (including "No Limit")
- 🔄 **Multiple Capitalization Styles**: Capitalize, ALL CAPS, lowercase, or random
- 📋 **Auto-Copy Option**: Automatically copy generated passphrases to your clipboard
- 🚫 **Profanity Filter**: Optional filter to reject explicit words
- 🌐 **No Data Storage**: Zero server-side logging or tracking

## 🛠️ Technical Stack

### Core Technologies
- **Firebase Hosting** - Static site hosting with automatic HTTPS
- **Vanilla JavaScript, HTML, and CSS** - No frameworks, lightweight and fast

### APIs & Data Sources
- **Random Word API** - `https://random-word-api.herokuapp.com/word` - External API for word generation with secure HTTPS transit
- **naughty-words** - Community-maintained profanity list (loaded from CDN via `cdn.jsdelivr.net/npm/naughty-words/en.json`) - Used for the optional profanity filter

### Security & Randomization
- **Web Crypto API** - `window.crypto.getRandomValues()` - Cryptographically secure random number generation using the browser's underlying OS entropy
- **Rejection Sampling** - Bias-free random selection from word lists

## 📫 Deployment

1. Fork this repository
2. Set up Firebase project
3. Add FIREBASE_TOKEN as GitHub secret
4. Push to main branch

## 🚀 Live Web App Demonstration
[Try it here](https://random-pass-phrase.web.app/)
```
https://random-pass-phrase.web.app/
```
