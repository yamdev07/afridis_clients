import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { api } from "../api/clientflow";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "null")
      : null;

  useEffect(() => {
    let intervalId;

    const fetchSummary = async () => {
      try {
        const data = await api.getDashboardSummary();
        setSummary(data);
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement du dashboard:", err);
        setError(err.message || "Erreur de chargement");
        setSummary((prev) => prev || {
          clients: 0,
          installed: 0,
          pending: 0,
          tv: 0,
          totalRevenue: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
    intervalId = setInterval(fetchSummary, 30000); // rafraîchissement toutes les 30s

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  if (loading)
    return <p style={{ padding: "20px" }}>Chargement des données...</p>;
  if (error)
    return (
      <p style={{ padding: "20px", color: "red" }}>Erreur: {error}</p>
    );

  const roleLabel =
    user?.role === "super_admin"
      ? "Admin suprême"
      : user?.role === "admin"
      ? "Admin"
      : "Commercial";

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p className="dashboard-subtitle">
              {user?.role === "super_admin" &&
                "Vue globale de l’activité et accès aux outils d’administration."}
              {user?.role === "admin" &&
                "Vue globale de l’activité pour la gestion opérationnelle."}
              {user?.role === "commercial" &&
                "Suivez vos performances commerciales et vos clients."}
            </p>
          </div>
          <span className="role-badge">{roleLabel}</span>
        </header>

        <div className="row mb-4">
          <Stat title="Total Clients" value={summary?.clients} />
          <Stat title="Installés" value={summary?.installed} />
          <Stat title="En attente" value={summary?.pending} />
          <Stat title="Services actifs" value={summary?.tv} />
          {user?.role !== "commercial" && (
            <Stat
              title="Revenus totaux (FCFA)"
              value={summary?.totalRevenue?.toLocaleString("fr-FR")}
            />
          )}
        </div>

        <section className="row g-4">
          <div className="col-md-8">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">Installés vs en attente</h5>
                <p className="text-muted mb-3">
                  Répartition actuelle des clients installés par rapport aux
                  clients en attente.
                </p>
                <BarChart
                  installed={summary?.installed || 0}
                  pending={summary?.pending || 0}
                  total={summary?.clients || 0}
                />
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">Répartition statut</h5>
                <p className="text-muted mb-3">
                  Vue synthétique des statuts clients.
                </p>
                <DonutLike
                  installed={summary?.installed || 0}
                  pending={summary?.pending || 0}
                />
              </div>
            </div>
          </div>
        </section>

        {user?.role === "super_admin" && (
          <section className="row g-4 mt-3">
            <div className="col-md-6">
              <div className="card h-100 border-primary">
                <div className="card-body">
                  <h5 className="card-title">Administration</h5>
                  <p className="text-muted mb-2">
                    Gérez les comptes administrateurs et commerciaux depuis le
                    module d’administration.
                  </p>
                  <p className="mb-0">
                    Accès rapide via le menu latéral &quot;Administration&quot;.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
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

function BarChart({ installed, pending, total }) {
  const max = Math.max(installed + pending, 1);
  const installedPct = Math.round((installed / max) * 100);
  const pendingPct = Math.round((pending / max) * 100);

  return (
    <div className="bar-chart">
      <div className="bar-row">
        <span className="bar-label">Installés</span>
        <div className="bar-track">
          <div
            className="bar-fill bar-fill-installed"
            style={{ width: `${installedPct}%` }}
          />
        </div>
        <span className="bar-value">{installed}</span>
      </div>
      <div className="bar-row">
        <span className="bar-label">En attente</span>
        <div className="bar-track">
          <div
            className="bar-fill bar-fill-pending"
            style={{ width: `${pendingPct}%` }}
          />
        </div>
        <span className="bar-value">{pending}</span>
      </div>
      <p className="text-muted mt-2">
        Total suivi : <strong>{total}</strong> clients.
      </p>
    </div>
  );
}

function DonutLike({ installed, pending }) {
  const total = installed + pending || 1;
  const installedPct = Math.round((installed / total) * 100);
  const pendingPct = 100 - installedPct;

  return (
    <div className="donut-like">
      <div className="donut-legend">
        <div className="legend-item">
          <span className="legend-dot installed" /> Installés ({installedPct}%)
        </div>
        <div className="legend-item">
          <span className="legend-dot pending" /> En attente ({pendingPct}%)
        </div>
      </div>
      <div className="donut-bars">
        <div
          className="donut-segment installed"
          style={{ flex: installed || 0.5 }}
        />
        <div
          className="donut-segment pending"
          style={{ flex: pending || 0.5 }}
        />
      </div>
    </div>
  );
}
