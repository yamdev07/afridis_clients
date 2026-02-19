import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <aside
      className="bg-dark text-white d-flex flex-column p-3"
      style={{ height: "100vh", width: "260px", position: "sticky", top: 0 }}
    >
      <h2 className="text-center mb-4">ClientFlow CRM</h2>

      <nav className="flex-grow-1">
        <ul className="nav nav-pills flex-column gap-1">
          <li
            className={`nav-link text-start ${
              isActive("/dashboard") ? "bg-secondary" : ""
            }`}
            onClick={() => navigate("/dashboard")}
            style={{ cursor: "pointer" }}
          >
            Dashboard
          </li>

          <li
            className={`nav-link text-start ${
              isActive("/clients") ? "bg-secondary" : ""
            }`}
            onClick={() => navigate("/clients")}
            style={{ cursor: "pointer" }}
          >
            Clients
          </li>

          <li
            className={`nav-link text-start ${
              isActive("/services") ? "bg-secondary" : ""
            }`}
            onClick={() => navigate("/services")}
            style={{ cursor: "pointer" }}
          >
            Services
          </li>

          <li
            className={`nav-link text-start ${
              isActive("/reports") ? "bg-secondary" : ""
            }`}
            onClick={() => navigate("/reports")}
            style={{ cursor: "pointer" }}
          >
            Rapports
          </li>

          <li
            className={`nav-link text-start ${
              isActive("/import") ? "bg-secondary" : ""
            }`}
            onClick={() => navigate("/import")}
            style={{ cursor: "pointer" }}
          >
            Import PDF / CSV
          </li>

          <li
            className={`nav-link text-start ${
              isActive("/export") ? "bg-secondary" : ""
            }`}
            onClick={() => navigate("/export")}
            style={{ cursor: "pointer" }}
          >
            Export PDF / CSV
          </li>

          <hr />

          <li
            className={`nav-link text-start ${
              isActive("/profile") ? "bg-secondary" : ""
            }`}
            onClick={() => navigate("/profile")}
            style={{ cursor: "pointer" }}
          >
            Profil
          </li>
        </ul>
      </nav>

      <button
        className="btn btn-danger mt-3 w-100"
        style={{ cursor: "pointer" }}
        onClick={handleLogout}
      >
        Déconnexion
      </button>
    </aside>
  );
}

export default Sidebar;

