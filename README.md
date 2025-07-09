# 🍽️ Ogaden Restaurant Management System

A full-featured mobile application that connects customers with restaurants across Ethiopia, enabling food discovery, ordering, and delivery — all in one place.

Built with **Flutter + Firebase**, the app supports both customers and restaurant owners.

---

## 🚀 Features

### 👤 User Module
- User registration & login (Firebase Authentication)
- Profile management (to be added)
- View order history

### 🍴 Restaurant Module
- Browse nearby restaurants
- View restaurant menu with pricing and images
- Add items to cart
- Place orders for dine-in or delivery

### 🛒 Ordering & Checkout
- Real-time cart system with quantity controls
- Checkout with mock payment screen
- Order confirmation screen
- Orders stored in Firestore

### 🔁 Order History
- View previous orders from Firestore
- Includes date, total, and item details

### 🔜 Coming Soon
- Restaurant Admin Panel (manage orders)
- Push notifications (order status)
- Real payment gateway integration
- Role-based access for admins

---

## 🧰 Tech Stack

| Layer         | Technology        |
|---------------|-------------------|
| **Frontend**  | Flutter (Dart)     |
| **Backend**   | Firebase Firestore, Firebase Auth |
| **State Mgmt**| Provider           |
| **Database**  | Cloud Firestore    |
| **Auth**      | Firebase Authentication |
| **UI**        | Material Design + Custom Widgets |

---

## 📁 Project Structure (Simplified)

lib/
├── screens/
│ ├── auth/ # Login & Register
│ ├── home/ # Restaurant list
│ ├── menu/ # Menu items
│ ├── cart/ # Cart and checkout
│ ├── order/ # Order history & confirmation
│ └── payment/ # Payment screen
├── models/ # Data models (MenuItem, Restaurant, CartItem)
├── providers/ # CartProvider for state management
├── services/ # Firebase saveOrder, etc.
└── widgets/ # Reusable UI components

yaml
Copy
Edit

---

## 🔧 Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/cherinetwoyesa/ORMS.git
   cd ogaden-app
Install dependencies:

bash
Copy
Edit
flutter pub get
Set up Firebase:

Create a Firebase project

Add Android/iOS app and download google-services.json

Place google-services.json in /android/app

Run the app:

bash
Copy
Edit
flutter run
