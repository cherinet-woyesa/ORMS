import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import SignUp from "./pages/SignUp"; 
import MenuManagement from "./pages/MenuManagement";
import ReservationManagement from "./pages/ReservationManagement";
import OrderPage from "./pages/OrderPage"; // Assuming you have an OrderPage component
import AnalyticsPage from "./pages/AnalyticsPage";
import ReservationsPage from "./pages/ReservationsPage";
import UsersPage from "./pages/UsersPage";
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<SignUp />} /> {/* ✅ */}
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/menu" element={<MenuManagement />} />
          <Route path="/reservations" element={<ReservationManagement />} />
          <Route path="/orders" element={<OrderPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/users" element={<UsersPage />} />
          {/* Add more routes as needed */}
          <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
