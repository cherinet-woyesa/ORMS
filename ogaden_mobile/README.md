# Ogaden Mobile

A modern Flutter app for restaurant discovery, ordering, and reservations, built for the Ogaden region. Supports web, Android, and iOS.

---

## 🚀 Features
- User authentication (Firebase)
- Restaurant listing & search
- Menu browsing
- Cart & order management
- Table reservation
- Responsive UI for web & mobile

---

## 🛠️ Getting Started

### 1. **Clone the Repository**
```sh
git clone https://github.com/cherinet-woyesa/ORMS.git
cd ORMS/ogaden_mobile
```

### 2. **Install Dependencies**
```sh
flutter pub get
```

### 3. **Set Up Firebase**
- Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
- Enable **Email/Password Authentication** in the Auth section.
- Create a **Web App** in your Firebase project settings and copy the config values.
- Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) and place them in the appropriate folders if building for mobile.

### 4. **Configure Environment Variables**
Create a `.env` file in the root of `ogaden_mobile/`:

```
API_KEY=your_firebase_api_key
AUTH_DOMAIN=your_firebase_auth_domain
PROJECT_ID=your_firebase_project_id
STORAGE_BUCKET=your_firebase_storage_bucket
MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
APP_ID=your_firebase_app_id
```

**Note:**
- Do **not** use quotes around values.
- Do **not** use `VITE_` or other prefixes.
- Example:
  ```
  API_KEY=AIzaSy...yourkey...
  AUTH_DOMAIN=yourapp.firebaseapp.com
  ...
  ```

### 5. **Add .env to Assets**
In `pubspec.yaml`, ensure:
```yaml
flutter:
  assets:
    - .env
```

---

## ▶️ Running the App

### **Web**
```sh
flutter run -d chrome
```

### **Android/iOS**
```sh
flutter run
```

---

## 🐞 Troubleshooting
- **Blank screen on web?**
  - Make sure `.env` is in the root and listed in `pubspec.yaml` assets.
  - Check browser console for errors.
  - Ensure Firebase config is correct and matches your project.
- **Login not working?**
  - Confirm Email/Password auth is enabled in Firebase.
  - Check for typos in `.env`.
- **.env not loading?**
  - Stop and restart the app after changes.

---

## 📁 Project Structure
- `lib/` — Main Flutter code
- `screens/` — UI pages
- `models/` — Data models
- `services/` — Firebase and business logic
- `widgets/` — Reusable UI components

---

## 🙏 Credits
- Built with [Flutter](https://flutter.dev/)
- Firebase for backend/auth
- UI inspired by modern food delivery apps

---

## 📬 Contact
For questions or contributions, open an issue or PR on GitHub.
