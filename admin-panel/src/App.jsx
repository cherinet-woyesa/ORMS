import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import SignUp from "./pages/SignUp"; 
import MenuManagement from "./pages/MenuManagement";
import ReservationManagement from "./pages/ReservationManagement";
import OrderPage from "./pages/OrderPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ReservationsPage from "./pages/ReservationsPage";
import UsersPage from "./pages/UsersPage";
import KitchenDisplay from "./pages/KitchenDisplay";
import ReviewsPage from "./pages/ReviewsPage";
import PromotionsPage from "./pages/PromotionsPage";
import CustomersPage from "./pages/CustomersPage";
import DeliveryPage from "./pages/DeliveryPage";
import ScheduledOrdersPage from "./pages/ScheduledOrdersPage";
import RevenueReportsPage from "./pages/RevenueReportsPage";
import QRGeneratorScreen from "./pages/QRGeneratorScreen";
import InventoryPage from "./pages/InventoryPage";
import StaffPage from "./pages/StaffPage";
import TablesPage from "./pages/TablesPage";
import RestaurantsPage from "./pages/RestaurantsPage";
import WaitlistPage from "./pages/WaitlistPage";
import GiftCardsPage from "./pages/GiftCardsPage";
import SettingsPage from "./pages/SettingsPage";
import DriverLogin from "./pages/DriverLogin";
import DriverApp from "./DriverApp";
import AdminLayout from "./components/AdminLayout";

function AdminRoute({ children }) {
  return <AdminLayout>{children}</AdminLayout>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          
          <Route path="/admin" element={<AdminRoute><Dashboard /></AdminRoute>} />
          <Route path="/restaurants" element={<AdminRoute><RestaurantsPage /></AdminRoute>} />
          <Route path="/menu" element={<AdminRoute><MenuManagement /></AdminRoute>} />
          <Route path="/reservations" element={<AdminRoute><ReservationManagement /></AdminRoute>} />
          <Route path="/orders" element={<AdminRoute><OrderPage /></AdminRoute>} />
          <Route path="/analytics" element={<AdminRoute><AnalyticsPage /></AdminRoute>} />
          <Route path="/users" element={<AdminRoute><UsersPage /></AdminRoute>} />
          <Route path="/kitchen" element={<AdminRoute><KitchenDisplay /></AdminRoute>} />
          <Route path="/reviews" element={<AdminRoute><ReviewsPage /></AdminRoute>} />
          <Route path="/promotions" element={<AdminRoute><PromotionsPage /></AdminRoute>} />
          <Route path="/customers" element={<AdminRoute><CustomersPage /></AdminRoute>} />
          <Route path="/delivery" element={<AdminRoute><DeliveryPage /></AdminRoute>} />
          <Route path="/scheduled-orders" element={<AdminRoute><ScheduledOrdersPage /></AdminRoute>} />
          <Route path="/revenue" element={<AdminRoute><RevenueReportsPage /></AdminRoute>} />
          <Route path="/qr-generator" element={<AdminRoute><QRGeneratorScreen /></AdminRoute>} />
          <Route path="/inventory" element={<AdminRoute><InventoryPage /></AdminRoute>} />
          <Route path="/staff" element={<AdminRoute><StaffPage /></AdminRoute>} />
          <Route path="/tables" element={<AdminRoute><TablesPage /></AdminRoute>} />
          <Route path="/waitlist" element={<AdminRoute><WaitlistPage /></AdminRoute>} />
          <Route path="/gift-cards" element={<AdminRoute><GiftCardsPage /></AdminRoute>} />
          <Route path="/settings" element={<AdminRoute><SettingsPage /></AdminRoute>} />
          <Route path="/driver-login" element={<DriverLogin />} />
          <Route path="/driver" element={<DriverApp />} />
          
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
