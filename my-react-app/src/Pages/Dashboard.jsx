import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    // Simulation d'appel API
    setTimeout(() => {
      setSummary({
        clients: 124,
        installed: 98,
        pending: 26,
        tv: 87,
      });
      setLoading(false);
    }, 1200);
  }, []);

  // Simulation légère variation automatique
  useEffect(() => {
    if (!summary) return;

    const interval = setInterval(() => {
      setSummary(prev => ({
        ...prev,
        clients: prev.clients + Math.floor(Math.random() * 2),
        installed: prev.installed + Math.floor(Math.random() * 2),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [summary]);

  if (loading) return <p style={{ padding: "20px" }}>Chargement des données...</p>;

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Dashboard</h1>
          <span className="role-badge">{user?.role || "Admin"}</span>
        </header>

        <div className="row">
          <Stat title="Total Clients" value={summary?.clients} />
          <Stat title="Installés" value={summary?.installed} />
          <Stat title="En attente" value={summary?.pending} />
          <Stat title="TV Actives" value={summary?.tv} />
        </div>
      </main>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="col-md-3 mb-3">
      <div className="stat-card">
        <p className="stat-title">{title}</p>
        <h3 className="stat-value">{value ?? "-"}</h3>
      </div>
    </div>
  );
}
