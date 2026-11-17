# 🍽️ Foodopedia — Global Culinary Encyclopedia

> **"A website for all the foodies around the world."**  
> Explore authentic dishes, ingredients, preparation methods, cultural significance, and food origins from across the globe.

---

## 📖 Overview

**Foodopedia** is an interactive web-based culinary encyclopedia designed for food lovers, home cooks, and cultural enthusiasts. Rather than offering just quick recipes, Foodopedia documents the **story behind every dish**—covering its historical roots, traditional ingredients, culinary techniques, cultural rituals, and regional variations.

The platform features **320 curated entries** (**113 iconic main dishes** and **207 regional variations**) spanning **11 global cuisines**, complete with real-time search autocomplete, dietary filtering, a favorites collection, user profiles with custom avatars, in-app feedback, and a hybrid **LocalStorage + Firebase Cloud Firestore** architecture for instant, offline-resilient performance.

---

## ✨ Key Features

### 🌍 Culinary Discovery & Encyclopedia
- **320+ Curated Dishes & Variations:** Detailed entries across **11 world cuisines** (*Japanese, Italian, Indian, Chinese, Spanish, Mexican, French, Thai, Nepali, Russian, and Greek*).
- **5-Pillar Culinary Articles:** Every dish and variation includes structured deep-dives into:
  1. 📜 **History & Origin** — How and when the dish evolved.
  2. 🧄 **Key Ingredients** — Essential components and regional produce.
  3. 👨‍🍳 **Preparation Method** — Traditional cooking techniques and craftsmanship.
  4. 🏮 **Cultural Importance** — Etiquette, festivals, and social traditions.
  5. 🍱 **Variations & Regional Styles** — Local adaptations and global fusion spins.
- **Interactive Image Carousel:** Browse multiple high-resolution photos per dish on the detail page (`food.html`) with automatic fallback imagery.

### 🔍 Smart Search & Filtering
- **Live Autocomplete Suggestions:** Instant dropdown previews as you type, showing dish thumbnails, cuisine names, and dietary classification across both primary dishes and sub-variations.
- **Dietary Type Filter:** Filter dishes on the home page or within any cuisine by:
  - 🟢 **Veg**
  - 🔴 **Non-Veg**
  - 🟡 **Both**
  - **All Types**
- **Cuisine Explorer (`cuisine.html`):** Browse dishes grouped by country flag and cuisine, with dedicated per-cuisine search and dietary filtering.

### ❤️ Favorites Management
- **One-Click Likes:** Save or remove favorite dishes from any card or detail view.
- **Live Navbar Counter:** Real-time badge in the navigation bar tracking saved dishes across tabs and browser sessions.
- **Dedicated Favorites Page (`like.html`):** Manage all bookmarked dishes in one place with smooth card-removal animations.

### 🔐 Hybrid Authentication & User Profiles
- **Cinematic Intro & Auth Portal (`auth.html`):** Features an animated 20-tile food photography grid and smooth transitions between Login and Sign-Up modes.
- **Auto Dial-Code Lookup:** Automatically populates international phone prefixes for **190+ countries** (`js/countries.js`) when selecting a Country of Origin.
- **Instant Local + Cloud Sync:** Authenticates in `0ms` using `localStorage` caching and synchronizes user accounts asynchronously with **Firebase Cloud Firestore** (with a 2-second network timeout fallback so the UI never blocks).
- **Profile & Avatar Customization (`account.html`):**
  - Edit First Name, Last Name, and Country of Origin.
  - Choose from **10 custom profile avatars** via an interactive modal selector.
  - Password-verified permanent account deletion (removes data from both local storage and Firestore).

### 💬 Feedback Widget & Admin Data Export
- **Floating Feedback System:** Accessible on all main pages via the floating `💬` button, storing feedback locally and syncing to Firestore's `feedback` collection.
- **Admin Mode & JSON Exports:** Logging in with administrator credentials unlocks **Download Data** (`foodopedia_users.json`) and **Download Feedback** (`foodopedia_feedback.json`) buttons directly in the navigation bar, merging local and Firestore records into downloadable JSON files.

---

## 🛠️ Tech Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | HTML5, CSS3 (Custom Design System, CSS Variables, Responsive Grid & Flexbox), Vanilla JavaScript (ES6 Modules) |
| **Typography & UI** | Google Fonts (`Outfit` & `Plus Jakarta Sans`), Custom SVG Icons, Toast Notification System |
| **Cloud & Database** | Firebase SDK v10.11.0 (Cloud Firestore, Firebase Analytics) |
| **Client Storage** | `localStorage` (Users, Liked Dishes, Feedback cache) & `sessionStorage` (Active Auth Session) |
| **Node Packages** | `express`, `cors`, `body-parser`, `sqlite`, `sqlite3` (configured in `package.json` for optional local backend extensions) |

---

## 📂 Project Structure

```text
Foodopedia/
├── index.html              # Home page: Hero search, autocomplete, dietary filter & dish catalog
├── cuisine.html            # World cuisines directory & per-cuisine dish browser
├── food.html               # Dish detail view: Photo carousel, metadata tags, 5-part article & variations
├── like.html               # Saved favorite dishes page
├── auth.html               # Cinematic intro, Login & Sign-Up portal
├── account.html            # User profile management, avatar selector & account deletion
├── package.json            # Node.js package metadata and dependencies
├── css/
│   └── style.css           # Global stylesheet, CSS variables, cards, carousel & responsive styles
├── js/
│   ├── data.js             # Curated dataset of 113 main dishes & 207 variations across 11 cuisines
│   ├── auth.js             # Auth logic, route protection, likes system, feedback widget & admin exports
│   ├── account.js          # Profile editing, avatar modal logic & account deletion flow
│   ├── firebase-config.js  # Firebase app, Cloud Firestore & Analytics initialization
│   ├── countries.js        # List of 190+ countries with international dialing prefixes
│   └── food.js             # Standalone dish lookup & like helper script
└── assets/
    └── images/             # Dish photography organized by cuisine + user profile avatars
        ├── avatars/        # avatar1.png – avatar10.png
        ├── japanese/
        ├── italian/
        ├── indian/
        ├── chinese/
        ├── spanish/
        ├── mexican/
        ├── french/
        ├── thai/
        ├── nepali/
        ├── russian/
        ├── greek/
        └── ...             # Additional cuisine asset directories (american, brazilian, korean, etc.)
```

---

## 🚀 Getting Started

Because Foodopedia uses native JavaScript ES6 modules (`<script type="module">`), it should be served over a local HTTP server rather than opened directly via `file://`.

### 1. Clone or Open the Repository
```bash
cd /Users/ajayparmar/Foodopedia
```

### 2. Start a Local Web Server
Use any of the following methods to launch the app locally:

**Using Python (built-in on macOS/Linux):**
```bash
python3 -m http.server 8000
```

**Using Node.js (`npx serve`):**
```bash
npx serve .
```

**Using VS Code:**
- Install the **Live Server** extension, right-click `index.html`, and select **"Open with Live Server"**.

### 3. Open in Browser
Navigate to `http://localhost:8000` (or the port shown in your terminal). Unauthenticated visitors are automatically redirected to `auth.html`.

---

## 🔑 Demo & Admin Credentials

You can create a new account on the **Sign Up** tab, or log in immediately using the built-in **Admin Account** to test administrative features (such as exporting user and feedback JSON data):

| Field | Credential |
| :--- | :--- |
| **Email / Identifier** | `admin@foodopedia.com` *(or `admin`)* |
| **Password** | `admin123` |

---

## 🌐 Supported Cuisines in Dataset

| Cuisine | Sample Iconic Dishes Included |
| :--- | :--- |
| 🇯🇵 **Japanese** | Sushi, Ramen, Tempura, Okonomiyaki, Takoyaki, Tonkatsu, Udon, Matcha Desserts |
| 🇮🇹 **Italian** | Neapolitan Pizza, Pasta Carbonara, Risotto, Lasagna, Gelato, Tiramisu, Osso Buco |
| 🇮🇳 **Indian** | Biryani, Butter Chicken, Masala Dosa, Rogan Josh, Chole Bhature, Paneer Tikka |
| 🇨🇳 **Chinese** | Peking Duck, Dim Sum, Mapo Tofu, Kung Pao Chicken, Xiaolongbao, Hot Pot |
| 🇪🇸 **Spanish** | Paella, Jamón Ibérico, Gazpacho, Patatas Bravas, Churros, Tortilla Española |
| 🇲🇽 **Mexican** | Tacos al Pastor, Mole Poblano, Tamales, Chiles en Nogada, Pozole, Guacamole |
| 🇫🇷 **French** | Coq au Vin, Bouillabaisse, Croissant, Ratatouille, Beef Bourguignon, Crème Brûlée |
| 🇹🇭 **Thai** | Pad Thai, Tom Yum Goong, Green Curry, Som Tum, Massaman Curry, Mango Sticky Rice |
| 🇳🇵 **Nepali** | Dal Bhat, Momo, Sel Roti, Thukpa, Yomari, Chatamari, Newari Khaja Set |
| 🇷🇺 **Russian** | Borscht, Beef Stroganoff, Pelmeni, Blini, Olivier Salad, Pirozhki |
| 🇬🇷 **Greek** | Moussaka, Souvlaki, Gyro, Spanakopita, Horiatiki (Greek Salad), Baklava |

---

## 📄 License

This project is licensed under the **ISC License** (see `package.json`).  
© 2026 **Foodopedia** — Crafted for food lovers worldwide.
