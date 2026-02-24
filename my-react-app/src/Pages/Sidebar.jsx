import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  let currentUser = null;
  try {
    if (typeof window !== "undefined") {
      currentUser = JSON.parse(localStorage.getItem("user") || "null");
    }
  } catch {
    currentUser = null;
  }

  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <aside
      className="flex flex-col bg-slate-900 text-slate-50 p-4 w-64 h-screen sticky top-0 shadow-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          <div className="h-8 w-8 rounded-xl bg-indigo-500 flex items-center justify-center text-xs font-bold">
            CF
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">ClientFlow</p>
            <p className="text-[11px] text-slate-400 leading-tight">
              Espace {currentUser?.role || "utilisateur"}
            </p>
          </div>
        </div>
        <NotificationBell />
      </div>

      <nav className="flex-grow overflow-y-auto">
        <ul className="space-y-1 text-sm">
          <li>
            <button
              type="button"
              className={`w-full text-left px-3 py-2 rounded-lg transition hover:bg-slate-800 ${
                isActive("/dashboard") ? "bg-slate-800 text-white" : "text-slate-200"
              }`}
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </button>
          </li>

          <li>
            <button
              type="button"
              className={`w-full text-left px-3 py-2 rounded-lg transition hover:bg-slate-800 ${
                isActive("/clients") ? "bg-slate-800 text-white" : "text-slate-200"
              }`}
              onClick={() => navigate("/clients")}
            >
              Clients
            </button>
          </li>

          <li>
            <button
              type="button"
              className={`w-full text-left px-3 py-2 rounded-lg transition hover:bg-slate-800 ${
                isActive("/services") ? "bg-slate-800 text-white" : "text-slate-200"
              }`}
              onClick={() => navigate("/services")}
            >
              Services
            </button>
          </li>

          <li>
            <button
              type="button"
              className={`w-full text-left px-3 py-2 rounded-lg transition hover:bg-slate-800 ${
                isActive("/reports") ? "bg-slate-800 text-white" : "text-slate-200"
              }`}
              onClick={() => navigate("/reports")}
            >
              Rapports
            </button>
          </li>

          {currentUser?.role === "super_admin" && (
            <>
              <li className="pt-2 border-t border-slate-800 mt-2">
                <button
                  type="button"
                  className={`w-full text-left px-3 py-2 rounded-lg transition hover:bg-slate-800 ${
                    isActive("/admin/users") ? "bg-slate-800 text-white" : "text-slate-200"
                  }`}
                  onClick={() => navigate("/admin/users")}
                >
                  Administration
                </button>
              </li>
            </>
          )}

          <li>
            <button
              type="button"
              className={`w-full text-left px-3 py-2 rounded-lg transition hover:bg-slate-800 ${
                isActive("/import") ? "bg-slate-800 text-white" : "text-slate-200"
              }`}
              onClick={() => navigate("/import")}
            >
              Import PDF / CSV
            </button>
          </li>

          <li>
            <button
              type="button"
              className={`w-full text-left px-3 py-2 rounded-lg transition hover:bg-slate-800 ${
                isActive("/export") ? "bg-slate-800 text-white" : "text-slate-200"
              }`}
              onClick={() => navigate("/export")}
            >
              Export PDF / CSV
            </button>
          </li>

          <li className="pt-2 border-t border-slate-800 mt-2">
            <button
              type="button"
              className={`w-full text-left px-3 py-2 rounded-lg transition hover:bg-slate-800 ${
                isActive("/profile") ? "bg-slate-800 text-white" : "text-slate-200"
              }`}
              onClick={() => navigate("/profile")}
            >
              Profil
            </button>
          </li>
        </ul>
      </nav>

      <button
        className="mt-4 inline-flex items-center justify-center rounded-lg border border-red-500/70 bg-red-500/90 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-600 transition"
        onClick={handleLogout}
      >
        Déconnexion
      </button>
    </aside>
  );
}

export default Sidebar;

