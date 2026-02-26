import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLink = (path, label) => (
    <Link
      to={path}
      className={`block px-4 py-2 rounded-lg transition ${
        location.pathname === path
          ? "bg-indigo-600 text-white"
          : "text-gray-400 hover:bg-gray-800 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      <aside className="w-64 bg-gray-900 p-6 hidden md:flex flex-col">
        <h1 className="text-2xl font-bold mb-10 text-indigo-500">
          CollegeEMS
        </h1>

        <nav className="flex flex-col space-y-3 flex-1">
          {navLink("/dashboard", "Dashboard")}
          {navLink("/my-applications", "My Applications")}

          {user?.role === "admin" &&
            navLink("/admin", "Admin Panel")}

          {(user?.role === "admin" || user?.canCreateEvent) &&
            navLink("/create-event", "Create Event")}

          {user?.role === "admin" &&
            navLink("/manage-events", "Manage Events")}
        </nav>

        <div className="mt-auto">
          <p className="text-sm text-gray-400 mb-2">
            {user?.name}
          </p>

          <button
            onClick={logout}
            className="w-full bg-red-600 hover:bg-red-500 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}