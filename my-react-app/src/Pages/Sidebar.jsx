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
      className="bg-dark text-white p-3"
      style={{ height: "100vh", width: "240px", position: "sticky", top: 0 }}
    >
      <h2 className="text-center mb-4">ClientFlow CRM</h2>

      <ul className="list-unstyled">

        <li className={`p-3 mb-2 rounded ${isActive("/dashboard") ? "bg-secondary" : ""}`}
            onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }}>
          Dashboard
        </li>

        <li className={`p-3 mb-2 rounded ${isActive("/clients") ? "bg-secondary" : ""}`}
            onClick={() => navigate("/clients")} style={{ cursor: "pointer" }}>
          Clients
        </li>

        <li className={`p-3 mb-2 rounded ${isActive("/services") ? "bg-secondary" : ""}`}
            onClick={() => navigate("/services")} style={{ cursor: "pointer" }}>
          Services
        </li>

        <li className={`p-3 mb-2 rounded ${isActive("/reports") ? "bg-secondary" : ""}`}
            onClick={() => navigate("/reports")} style={{ cursor: "pointer" }}>
          Rapports
        </li>

        <hr />

        <li className="p-3 mb-2 rounded"
            onClick={() => navigate("/import")} style={{ cursor: "pointer" }}>
          Importer PDF
        </li>

        <li className="p-3 mb-2 rounded"
            onClick={() => navigate("/export")} style={{ cursor: "pointer" }}>
          Exporter PDF
        </li>

        <li className="p-3 mt-4 rounded bg-danger text-center"
            style={{ cursor: "pointer" }}
            onClick={handleLogout}>
          Déconnexion
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;
