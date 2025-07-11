# ORMS Admin Panel

A modern React-based admin dashboard for managing restaurants, menus, orders, reservations, and analytics for the Ogaden Restaurant Management System (ORMS).

---

## 🚀 Features
- Admin authentication (Firebase)
- Dashboard analytics
- Menu management (add/edit/delete)
- Order and reservation management
- Responsive design

---

## 🛠️ Getting Started

### 1. **Clone the Repository**
```sh
git clone https://github.com/cherinet-woyesa/ORMS.git
cd ORMS/admin-panel
```

### 2. **Install Dependencies**
```sh
npm install
```

### 3. **Set Up Firebase**
- Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
- Enable **Email/Password Authentication** in the Auth section.
- Create a **Web App** in your Firebase project settings and copy the config values.

### 4. **Configure Environment Variables**
Create a `.env` file in the root of `admin-panel/`:

```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

**Note:**
- Do **not** use quotes around values.
- Example:
  ```
  VITE_FIREBASE_API_KEY=AIzaSy...yourkey...
  VITE_FIREBASE_AUTH_DOMAIN=yourapp.firebaseapp.com
  ...
  ```

---

## ▶️ Running the App

```sh
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal).

---

## 🐞 Troubleshooting
- **Blank screen or errors?**
  - Make sure `.env` is in the root and values are correct.
  - Check browser console for errors.
  - Ensure Firebase config matches your project.
- **Login not working?**
  - Confirm Email/Password auth is enabled in Firebase.
  - Check for typos in `.env`.
- **.env not loading?**
  - Stop and restart the app after changes.

---

## 📁 Project Structure
- `src/` — Main React code
- `components/` — Reusable UI components
- `pages/` — Main admin pages
- `constants/` — Static data (e.g., admin users)
- `context/` — React context for auth, etc.

---

## 🙏 Credits
- Built with [React](https://react.dev/), [Vite](https://vitejs.dev/), and [Tailwind CSS](https://tailwindcss.com/)
- Firebase for backend/auth
- UI inspired by modern admin dashboards

---

## 📬 Contact
For questions or contributions, open an issue or PR on GitHub.
