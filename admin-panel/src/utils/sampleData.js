import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const sampleUsers = [
  {
    name: "Ahmed Mohamed",
    email: "ahmed@example.com",
    phone: "+251 912 345 678",
    role: "admin",
    loyaltyPoints: 2500,
    loyaltyTier: "Gold",
    createdAt: new Date("2024-01-15"),
  },
  {
    name: "Fatima Ibrahim",
    email: "fatima@example.com",
    phone: "+251 912 345 679",
    role: "user",
    loyaltyPoints: 1200,
    loyaltyTier: "Silver",
    dietaryPreferences: ["Halal", "Vegetarian"],
    createdAt: new Date("2024-02-20"),
  },
  {
    name: "Mohamed Osman",
    email: "mohamed@example.com",
    phone: "+251 912 345 680",
    role: "user",
    loyaltyPoints: 4500,
    loyaltyTier: "Platinum",
    allergies: ["Peanuts"],
    createdAt: new Date("2024-03-10"),
  },
  {
    name: "Aisha Abdi",
    email: "aisha@example.com",
    phone: "+251 912 345 681",
    role: "manager",
    loyaltyPoints: 800,
    loyaltyTier: "Bronze",
    createdAt: new Date("2024-04-05"),
  },
  {
    name: "Ali Yusuf",
    email: "ali@example.com",
    phone: "+251 912 345 682",
    role: "user",
    loyaltyPoints: 300,
    loyaltyTier: "Bronze",
    dietaryPreferences: ["Halal"],
    createdAt: new Date("2024-05-12"),
  },
];

const sampleMenuItems = [
  { name: "Grilled Lamb Steak", category: "Main Course", price: 850, description: "Tender lamb steak grilled to perfection", available: true, image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400" },
  { name: "Chicken Biryani", category: "Main Course", price: 450, description: "Aromatic rice with spiced chicken", available: true, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400" },
  { name: "Vegetable Somal", category: "Appetizers", price: 180, description: "Traditional Somali vegetable pastry", available: true, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400" },
  { name: "Fresh Orange Juice", category: "Beverages", price: 120, description: "Freshly squeezed orange juice", available: true, image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400" },
  { name: "Camel Meat Stew", category: "Main Course", price: 650, description: "Traditional camel meat stew", available: true, image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400" },
  { name: "Banana Smoothie", category: "Beverages", price: 150, description: "Creamy banana smoothie", available: true, image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400" },
  { name: "Fruit Platter", category: "Desserts", price: 250, description: "Fresh seasonal fruits", available: true, image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400" },
  { name: "Mango Lassi", category: "Beverages", price: 130, description: "Sweet yogurt mango drink", available: true, image: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400" },
];

const sampleOrders = [
  { status: "completed", total: 1050, items: [{ name: "Chicken Biryani", quantity: 2, price: 450 }, { name: "Fresh Orange Juice", quantity: 2, price: 120 }] },
  { status: "pending", total: 1800, items: [{ name: "Grilled Lamb Steak", quantity: 2, price: 850 }, { name: "Fruit Platter", quantity: 1, price: 250 }] },
  { status: "completed", total: 650, items: [{ name: "Camel Meat Stew", quantity: 1, price: 650 }] },
  { status: "preparing", total: 430, items: [{ name: "Vegetable Somal", quantity: 2, price: 180 }, { name: "Mango Lassi", quantity: 1, price: 130 }] },
  { status: "completed", total: 900, items: [{ name: "Chicken Biryani", quantity: 2, price: 450 }] },
];

export async function generateSampleData() {
  console.log("Generating sample data...");
  
  try {
    // Add sample menu items
    for (const item of sampleMenuItems) {
      await addDoc(collection(db, "menu"), {
        ...item,
        createdAt: serverTimestamp(),
      });
    }
    console.log("✓ Added sample menu items");

    // Add sample users
    for (const user of sampleUsers) {
      await addDoc(collection(db, "users"), {
        ...user,
        createdAt: user.createdAt,
      });
    }
    console.log("✓ Added sample users");

    // Add sample orders
    for (let i = 0; i < sampleOrders.length; i++) {
      const order = sampleOrders[i];
      await addDoc(collection(db, "orders"), {
        ...order,
        createdAt: new Date(Date.now() - i * 86400000),
        timestamp: new Date(Date.now() - i * 86400000),
        userId: "sample-user-" + i,
      });
    }
    console.log("✓ Added sample orders");

    console.log("Sample data generation complete!");
    return true;
  } catch (error) {
    console.error("Error generating sample data:", error);
    return false;
  }
}

// Run if called directly
if (typeof window !== 'undefined') {
  window.generateSampleData = generateSampleData;
}
