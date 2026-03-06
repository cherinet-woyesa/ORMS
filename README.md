# ORMS - Ogaden Restaurant Management System

A complete restaurant management system with:
- **Admin Panel** (React + Vite + Tailwind CSS)
- **Mobile App** (Flutter + Firebase)
- **Cloud Functions** (Node.js)

## Quick Start

### Prerequisites
- Node.js 18+
- Flutter SDK
- Firebase Project

### Admin Panel Setup

```bash
cd admin-panel
cp .env.example .env
# Edit .env with your Firebase credentials
npm install
npm run dev
```

### Mobile App Setup

```bash
cd ogaden_mobile
flutter pub get
flutter run
```

### Cloud Functions Setup

```bash
cd functions
npm install
firebase functions:config:set twilio.sid="your_sid" twilio.token="your_token" twilio.phone="+1234567890"
firebase deploy --only functions
```

### Firebase Setup

1. Create Firebase project at https://console.firebase.google.com
2. Enable Authentication, Firestore, Storage
3. Set up security rules: `firestore.rules`
4. Deploy hosting: `firebase deploy --only hosting`

## Features

- Order Management
- Menu Management
- Table Reservations
- Delivery Tracking
- Driver App
- Kitchen Display with Sound Alerts
- Inventory Management
- Loyalty & Rewards
- QR Code Generation & Scanning
- Analytics & Reports
- SMS Notifications (Twilio)
- Push Notifications

## Deployment

```bash
# Build admin panel
npm run build

# Deploy to Firebase
firebase deploy
```
