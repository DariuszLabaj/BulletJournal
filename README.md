# 📝 Bullet Journal (p5.js)

A **local-first, touch-friendly Bullet Journal web app** built with **p5.js 2.0**.
Designed as a minimal, distraction-free journaling experience that runs entirely in the browser and stores data in `localStorage`.

> No backend. No accounts. Your data stays on your device.

---

## ✨ Features

* 📆 **Monthly Bullet Journal**
  * Automatic month creation
  * Task migration from previous months

* ✅ **Task tracking**
  * Daily completion grid
  * Tasks persist across months until removed

* 👤 **User onboarding**
  * Welcome → profile setup → greeting flow
  * Smooth scene transitions

* 🌍 **Internationalization (i18n)**
  * Automatic language detection
  * Fallback to default locale

* 🎨 **Light / Dark themes**
  * System theme detection
  * Manual toggle

* 📱 **Mobile-first**
  * Touch input support
  * Responsive canvas resizing

* 💾 **Local-only persistence**
  * Uses `localStorage`
  * Import / export journal data as JSON

* 🧪 **Debug tools**
  * Clear all local storage via keyboard shortcut

---

## 🛠️ Tech Stack

* **p5.js 2.0**
* Vanilla **JavaScript (ES6+)**
* HTML5 Canvas
* Browser `localStorage`
* Google Fonts + Material Symbols
* Web Audio (for UI SFX)

---

## 🧠 Architecture Overview

### App State Flow

```text
LOADING
   ↓
NEW USER SETUP
   ↓
MAIN (Bullet Journal)
```

Global state is handled in `draw()` via a simple state machine.

---

### Core Components

#### `UserData`

Handles:

* User profile (name, preferences, last login)
* Scene transitions (welcome, setup, greetings)
* Bullet journal data model:

  * Monthly entries
  * Tasks
  * Daily completion grid
* Persistence (save/load/import/export)

#### `BulletJournal`

Responsible for:

* Rendering the journal UI
* Handling journal interactions
* Connecting UI actions to `UserData`

#### `ResourceManager`

* Manages localized strings
* Automatically resolves best language match
* Supports parameterized strings (`{0}`, `{1}`, …)

---

## ⌨️ Keyboard Shortcuts

| Shortcut           | Action                                         |
| ------------------ | ---------------------------------------------- |
| `Ctrl + Shift + R` | Clear **all** localStorage (with confirmation) |
| `Ctrl + Shift + E` | Toggle light / dark theme                      |

---

## 🎯 Design Goals

* Zero friction journaling
* Offline-first
* No frameworks beyond p5.js
* Fully canvas-based UI
* Clear separation between:

  * Rendering
  * State
  * Persistence

---

## 🧩 Future Ideas

* Weekly / yearly views
* Habit analytics
* Cloud sync (optional)
* Keyboard-only navigation
* Printable export

---

## 🌐 Live Demo

The app is hosted via **GitHub Pages** and can be accessed here:

👉 **[https://dariuszlabaj.github.io/BulletJournal/](https://dariuszlabaj.github.io/BulletJournal/)**

No installation required — the journal runs entirely in the browser and stores data locally using `localStorage`.

⚠️ **Note:**
Clearing browser data, using private/incognito mode, or switching devices will remove locally stored journal data unless it is exported first.

---

## 📱 Mobile Access (QR Code)

Scan the QR code below to open the Bullet Journal directly on your phone or tablet:

![Bullet Journal – Mobile QR Code](https://api.qrserver.com/v1/create-qr-code/?size=240x240\&data=https://dariuszlabaj.github.io/BulletJournal/)

🔗 **Direct link:**
[https://dariuszlabaj.github.io/BulletJournal/](https://dariuszlabaj.github.io/BulletJournal/)

The app is fully touch-enabled and optimized for mobile use.

---

### ℹ️ Mobile Notes

* Works offline after first load
* Uses `localStorage` (data is device-specific)
* Export your data before switching devices or clearing browser storage

---

## 📢 Disclaimer & Attributions

This project uses third-party assets that are **not created by the author**:

### Fonts

* **Bricolage Grotesque**
  Provided via **Google Fonts**
  © The Bricolage Grotesque Project Authors
  Licensed under the **SIL Open Font License (OFL)**

* **Material Symbols**
  Provided by **Google**
  Licensed under the **Apache License 2.0**

Fonts are loaded at runtime and remain the property of their respective authors.

---

### Sound Effects

* **UI Toggle Sound**
  *“Click / Toggle”* sound by **jomse**
  Source: freesound.org
  Licensed under the **Creative Commons 0 (CC0) License**

The sound effect is free to use without attribution, but credit is given here voluntarily.

---

### Trademarks

Google Fonts and Material Symbols are trademarks of **Google LLC**.
This project is not affiliated with or endorsed by Google or freesound.org.

---

## 📜 License

MIT License
Feel free to fork, modify, and build on top of it.

---
