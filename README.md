# Secure Passphrase Generator

A zero-data-storage password/passphrase generator built with vanilla HTML, JavaScript, and CSS for a single lightweight web app deployed to Firebase Hosting.

## Features

- 🔐 Generates secure, memorable passphrases
- 🚀 No data stored anywhere
- 📱 Mobile-responsive design
- 🎨 Modern, clean UI
- ⚡ Instant generation
- 📋 Copy to clipboard

## Technical Stack

### Core Technologies
- **Firebase Hosting** - Static site hosting with automatic HTTPS
- **Vanilla JavaScript, HTML, and CSS** - No frameworks, lightweight and fast

### APIs & Data Sources
- **Random Word API** - `https://random-word-api.herokuapp.com/word` - External API for word generation with secure HTTPS transit
- **naughty-words** - Community-maintained profanity list (loaded from CDN via `cdn.jsdelivr.net/npm/naughty-words/en.json`) - Used for the optional profanity filter

### Security & Randomization
- **Web Crypto API** - `window.crypto.getRandomValues()` - Cryptographically secure random number generation using the browser's underlying OS entropy
- **Rejection Sampling** - Bias-free random selection from word lists

## Deployment

1. Fork this repository
2. Set up Firebase project
3. Add FIREBASE_TOKEN as GitHub secret
4. Push to main branch

## Live Web App Demonstration
[Click Here](https://random-pass-phrase.web.app/)
Or
```
https://random-pass-phrase.web.app/
```
