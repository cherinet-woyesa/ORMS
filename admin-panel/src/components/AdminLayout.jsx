import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

export default function AdminLayout({ children }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6 space-y-6">
        <h2 className="text-2xl font-bold text-blue-600">Ogaden Admin</h2>
        <nav className="flex flex-col space-y-2">
          <Link
            to="/admin"
            className="text-gray-700 hover:bg-blue-100 px-3 py-2 rounded"
          >
            🧾 Orders Dashboard
          </Link>
          <Link
            to="/menu"
            className="text-gray-700 hover:bg-blue-100 px-3 py-2 rounded"
          >
            🍽️ Menu Management
          </Link>
          <button
            onClick={handleLogout}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded"
          >
            🚪 Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
