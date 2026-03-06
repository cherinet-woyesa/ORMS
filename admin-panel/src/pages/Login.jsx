import { useState, useCallback, useEffect } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [shapes, setShapes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const newShapes = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      size: Math.random() * 80 + 40,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 5,
    }));
    setShapes(newShapes);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/admin');
    }
  }, [currentUser, navigate]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError(null);
      setIsLoading(true);

      try {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        navigate('/admin');
      } catch (err) {
        // If login fails, try to sign up
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
          try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            await setDoc(doc(db, 'users', userCredential.user.uid), {
              email: formData.email,
              name: formData.email.split('@')[0],
              role: 'user',
              loyaltyPoints: 0,
              loyaltyTier: 'Bronze',
              createdAt: serverTimestamp(),
            });
            navigate('/admin');
          } catch (signUpErr) {
            console.error('Sign up error:', signUpErr);
            setError('Email/password auth may be disabled. Try Google login instead.');
          }
        } else if (err.code === 'auth/empty-email') {
          setError('Please enter your email address');
        } else if (err.code === 'auth/wrong-password') {
          setError('Invalid password');
        } else {
          setError(err.message || 'An error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [formData.email, formData.password, navigate]
  );

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Google login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const provider = new FacebookAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Facebook login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedData = async () => {
    setIsLoading(true);
    try {
      // Sample users
      const sampleUsers = [
        { name: "Ahmed Mohamed", email: "ahmed@example.com", phone: "+251 912 345 678", role: "admin", loyaltyPoints: 2500, loyaltyTier: "Gold", createdAt: new Date("2024-01-15") },
        { name: "Fatima Ibrahim", email: "fatima@example.com", phone: "+251 912 345 679", role: "user", loyaltyPoints: 1200, loyaltyTier: "Silver", dietaryPreferences: ["Halal", "Vegetarian"], createdAt: new Date("2024-02-20") },
        { name: "Mohamed Osman", email: "mohamed@example.com", phone: "+251 912 345 680", role: "user", loyaltyPoints: 4500, loyaltyTier: "Platinum", allergies: ["Peanuts"], createdAt: new Date("2024-03-10") },
        { name: "Aisha Abdi", email: "aisha@example.com", phone: "+251 912 345 681", role: "manager", loyaltyPoints: 800, loyaltyTier: "Bronze", createdAt: new Date("2024-04-05") },
        { name: "Ali Yusuf", email: "ali@example.com", phone: "+251 912 345 682", role: "user", loyaltyPoints: 300, loyaltyTier: "Bronze", dietaryPreferences: ["Halal"], createdAt: new Date("2024-05-12") },
        { name: "Sara Jamal", email: "sara@example.com", phone: "+251 912 345 683", role: "user", loyaltyPoints: 1500, loyaltyTier: "Silver", createdAt: new Date("2024-06-01") },
        { name: "Omar Dash", email: "omar@example.com", phone: "+251 912 345 684", role: "staff", loyaltyPoints: 600, loyaltyTier: "Bronze", createdAt: new Date("2024-07-15") },
        { name: "Leila Mohamed", email: "leila@example.com", phone: "+251 912 345 685", role: "user", loyaltyPoints: 3200, loyaltyTier: "Gold", allergies: ["Shellfish"], createdAt: new Date("2024-08-20") },
      ];

      // Sample menu items
      const sampleMenuItems = [
        { name: "Grilled Lamb Steak", category: "Main Course", price: 850, description: "Tender lamb steak grilled to perfection", available: true },
        { name: "Chicken Biryani", category: "Main Course", price: 450, description: "Aromatic rice with spiced chicken", available: true },
        { name: "Vegetable Somal", category: "Appetizers", price: 180, description: "Traditional Somali vegetable pastry", available: true },
        { name: "Fresh Orange Juice", category: "Beverages", price: 120, description: "Freshly squeezed orange juice", available: true },
        { name: "Camel Meat Stew", category: "Main Course", price: 650, description: "Traditional camel meat stew", available: true },
        { name: "Banana Smoothie", category: "Beverages", price: 150, description: "Creamy banana smoothie", available: true },
        { name: "Fruit Platter", category: "Desserts", price: 250, description: "Fresh seasonal fruits", available: true },
        { name: "Mango Lassi", category: "Beverages", price: 130, description: "Sweet yogurt mango drink", available: true },
        { name: "Chicken Shawarma", category: "Main Course", price: 350, description: "Spiced chicken wrapped in pita", available: true },
        { name: "Falafel Plate", category: "Appetizers", price: 200, description: "Crispy chickpea fritters", available: true },
      ];

      // Sample orders
      const sampleOrders = [
        { status: "completed", total: 1050, items: [{ name: "Chicken Biryani", quantity: 2, price: 450 }, { name: "Fresh Orange Juice", quantity: 2, price: 120 }] },
        { status: "pending", total: 1800, items: [{ name: "Grilled Lamb Steak", quantity: 2, price: 850 }, { name: "Fruit Platter", quantity: 1, price: 250 }] },
        { status: "completed", total: 650, items: [{ name: "Camel Meat Stew", quantity: 1, price: 650 }] },
        { status: "preparing", total: 430, items: [{ name: "Vegetable Somal", quantity: 2, price: 180 }, { name: "Mango Lassi", quantity: 1, price: 130 }] },
        { status: "completed", total: 900, items: [{ name: "Chicken Biryani", quantity: 2, price: 450 }] },
        { status: "accepted", total: 550, items: [{ name: "Chicken Shawarma", quantity: 1, price: 350 }, { name: "Banana Smoothie", quantity: 1, price: 150 }] },
        { status: "completed", total: 1200, items: [{ name: "Grilled Lamb Steak", quantity: 1, price: 850 }, { name: "Mango Lassi", quantity: 2, price: 130 }] },
        { status: "ready", total: 380, items: [{ name: "Falafel Plate", quantity: 1, price: 200 }, { name: "Fresh Orange Juice", quantity: 1, price: 120 }] },
      ];

      // Add users
      for (const user of sampleUsers) {
        await setDoc(doc(db, "users", user.email.replace(/[^a-zA-Z0-9]/g, "_")), {
          ...user,
          createdAt: user.createdAt,
        });
      }
      console.log("✓ Added 8 sample users");

      // Add menu items
      for (const item of sampleMenuItems) {
        await addDoc(collection(db, "menu"), {
          ...item,
          createdAt: serverTimestamp(),
        });
      }
      console.log("✓ Added 10 menu items");

      // Add orders
      for (let i = 0; i < sampleOrders.length; i++) {
        const order = sampleOrders[i];
        await addDoc(collection(db, "orders"), {
          ...order,
          userId: sampleUsers[i % sampleUsers.length].email.replace(/[^a-zA-Z0-9]/g, "_"),
          createdAt: new Date(Date.now() - i * 86400000),
          timestamp: new Date(Date.now() - i * 86400000),
        });
      }
      console.log("✓ Added 8 sample orders");

      // Add restaurants
      await addDoc(collection(db, "restaurants"), {
        name: "Ogaden Restaurant - Main",
        location: "Jigjiga, Ethiopia",
        phone: "+251 912 345 678",
        email: "info@ogadenrestaurant.com",
        description: "Authentic Somali cuisine",
        rating: 4.5,
        isOpen: true,
        createdAt: serverTimestamp(),
      });
      console.log("✓ Added sample restaurant");

      alert("✅ Sample data generated successfully!\n\n- 8 Users\n- 10 Menu Items\n- 8 Orders\n- 1 Restaurant\n\nYou can now log in to test the system!");
    } catch (err) {
      console.error("Error generating seed data:", err);
      alert("Error generating sample data: " + err.message);
    }
    setIsLoading(false);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-500 ${darkMode ? 'bg-gray-900' : 'bg-primary-50'
      }`}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${darkMode
            ? 'from-gray-900 via-primary-900 to-gray-900'
            : 'from-primary-400 via-orange-500 to-primary-500'
          } opacity-90`} />

        {/* Floating Shapes */}
        {shapes.map((shape) => (
          <div
            key={shape.id}
            className={`absolute rounded-full opacity-20 ${darkMode ? 'bg-white' : 'bg-white'
              }`}
            style={{
              width: shape.size,
              height: shape.size,
              left: `${shape.x}%`,
              top: `${shape.y}%`,
              animation: `float ${shape.duration}s ease-in-out infinite`,
              animationDelay: `${shape.delay}s`,
            }}
          />
        ))}

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: darkMode
              ? 'radial-gradient(circle, #fff 1px, transparent 1px)'
              : 'radial-gradient(circle, #000 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}
        />
      </div>

      {/* Dark Mode Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute top-4 right-4 z-50 p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300"
      >
        {darkMode ? (
          <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </button>

      {/* Login Card */}
      <div className={`relative z-10 max-w-md w-full mx-4 ${darkMode ? 'bg-gray-800/90' : 'bg-white/90'
        } backdrop-blur-xl p-8 rounded-3xl shadow-2xl border ${darkMode ? 'border-gray-700/50' : 'border-white/20'
        }`}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 ${darkMode ? 'bg-gradient-to-br from-primary-500 to-orange-500' : 'bg-gradient-to-br from-primary-500 to-primary-500'
            } shadow-lg`}>
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Welcome Back
          </h1>
          <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Sign in to your admin account
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`mb-6 px-4 py-3 rounded-xl text-sm flex items-center ${darkMode
              ? 'bg-red-900/50 text-red-300 border border-red-800'
              : 'bg-red-50 text-red-600 border border-red-200'
            }`}>
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className={`w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-12 pr-4 py-3.5 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-offset-2 ${darkMode
                    ? 'bg-gray-700/50 border-gray-600 text-white focus:ring-primary-500 focus:border-primary-500 placeholder-gray-500'
                    : 'bg-gray-50 border-gray-200 text-gray-800 focus:ring-primary-500 focus:border-primary-500 placeholder-gray-400'
                  }`}
                placeholder="admin@example.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className={`w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-12 pr-12 py-3.5 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-offset-2 ${darkMode
                    ? 'bg-gray-700/50 border-gray-600 text-white focus:ring-primary-500 focus:border-primary-500 placeholder-gray-500'
                    : 'bg-gray-50 border-gray-200 text-gray-800 focus:ring-primary-500 focus:border-primary-500 placeholder-gray-400'
                  }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute inset-y-0 right-0 pr-4 flex items-center ${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className={`w-4 h-4 rounded border-gray-300 ${darkMode ? 'text-primary-500 focus:ring-primary-500' : 'text-primary-600 focus:ring-primary-600'
                  }`}
              />
              <span className={`ml-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Remember me
              </span>
            </label>
            <Link
              to="/forgot-password"
              className={`text-sm font-medium ${darkMode
                  ? 'text-primary-400 hover:text-primary-300'
                  : 'text-primary-600 hover:text-primary-700'
                }`}
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 px-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg ${darkMode
                ? 'bg-gradient-to-r from-primary-600 to-orange-600 hover:from-primary-500 hover:to-orange-500'
                : 'bg-gradient-to-r from-primary-600 to-primary-600 hover:from-primary-500 hover:to-primary-500'
              } ${isLoading ? 'opacity-75 cursor-not-allowed transform-none' : ''}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign In / Sign Up'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className={`absolute inset-0 flex items-center ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
            <div className={`w-full border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className={`px-4 ${darkMode ? 'bg-gray-800 text-gray-500' : 'bg-white text-gray-500'}`}>
              or continue with
            </span>
          </div>
        </div>

        {/* Social Login */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className={`flex items-center justify-center py-3 px-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${darkMode
                ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700 text-white'
                : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>
          <button
            onClick={handleFacebookLogin}
            disabled={isLoading}
            className={`flex items-center justify-center py-3 px-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${darkMode
                ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700 text-white'
                : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <svg className="w-5 h-5 mr-2 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </button>
        </div>

        {/* Sign Up Link */}
        <div className={`mt-6 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <p>
            Don't have an account?{' '}
            <Link
              to="/signup"
              className={`font-semibold ${darkMode
                  ? 'text-primary-400 hover:text-primary-300'
                  : 'text-primary-600 hover:text-primary-700'
                }`}
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Seed Data Button */}
        <div className="mt-4 text-center">
          <button
            onClick={handleSeedData}
            disabled={isLoading}
            className={`text-xs underline ${darkMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {isLoading ? 'Generating...' : 'Generate Sample Data (for testing)'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) rotate(5deg);
          }
          50% {
            transform: translateY(0) rotate(0deg);
          }
          75% {
            transform: translateY(20px) rotate(-5deg);
          }
        }
      `}</style>
    </div>
  );
}
