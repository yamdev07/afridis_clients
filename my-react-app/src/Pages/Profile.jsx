import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import "../styles/Dashboard.css";
import { api } from "../api/clientflow";

export default function Profile() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {
        name: "",
        email: "",
        role: "Commercial",
      };
    } catch {
      return { name: "", email: "", role: "Commercial" };
    }
  });

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await api.me();
        const merged = { ...user, ...data };
        setUser(merged);
        localStorage.setItem("user", JSON.stringify(merged));
        setForm({
          name: merged?.name || "",
          email: merged?.email || "",
          phone: merged?.phone || "",
        });
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err.message ||
          "Erreur lors du chargement du profil";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
  }, [user]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updated = { ...user, ...form };
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
  };

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
          <h1>Profil</h1>
          <span className="role-badge">{roleLabel}</span>
        </header>

        {error && <p className="text-danger mb-2">{error}</p>}
        {loading && (
          <p style={{ padding: "4px 0" }}>Chargement des informations...</p>
        )}

        <section className="profile-section row g-4">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title mb-3">Informations personnelles</h5>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Nom complet</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Nom et prénom"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">E‑mail</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="vous@exemple.com"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Téléphone</label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-control"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+225 ..."
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Mettre à jour localement
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title mb-3">Résumé du compte</h5>
                <p>
                  <strong>Nom :</strong> {user?.name || "Non renseigné"}
                </p>
                <p>
                  <strong>E‑mail :</strong> {user?.email || "Non renseigné"}
                </p>
                <p>
                  <strong>Téléphone :</strong>{" "}
                  {user?.phone || "Non renseigné"}
                </p>
                <p>
                  <strong>Rôle :</strong> {roleLabel}
                </p>
                {user?.agent_login && (
                  <p>
                    <strong>Login commercial :</strong> {user.agent_login}
                  </p>
                )}
              </div>
            </div>

            {/* Placeholder pour futures notifications */}
            <div className="card">
              <div className="card-body">
                <h5 className="card-title mb-3">Notifications</h5>
                <p className="text-muted mb-0">
                  Le module de notifications sera connecté ici (par exemple :
                  nouvelles ventes, installations planifiées, etc.).
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

