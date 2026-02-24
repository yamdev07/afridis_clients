import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { api } from "../api/clientflow";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
    agent_login: "",
  });
  const [creating, setCreating] = useState(false);

  const currentUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "null")
      : null;

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await api.listUsers();
        setUsers(data || []);
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err.message ||
          "Erreur lors du chargement des utilisateurs";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      const created = await api.createUser(form);
      setUsers((prev) => [created, ...prev]);
      setForm({
        name: "",
        email: "",
        password: "",
        role: "admin",
        agent_login: "",
      });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Erreur lors de la création de l’utilisateur";
      setError(message);
    } finally {
      setCreating(false);
    }
  };

  if (!currentUser || currentUser.role !== "super_admin") {
    return (
      <div className="d-flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-grow-1 p-4 md:p-6">
          <p className="text-danger">
            Accès refusé. Cette section est réservée à l’administrateur suprême.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="d-flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-grow-1 p-4 md:p-6 space-y-4">
        <header className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold">Administration des comptes</h1>
          <span className="badge bg-primary">Admin suprême</span>
        </header>

        <section className="bg-white rounded-xl shadow-sm p-4 md:p-5">
          <h2 className="text-lg font-medium mb-3">Créer un compte</h2>
          <form
            className="row g-3 text-sm"
            onSubmit={handleSubmit}
            autoComplete="off"
          >
            <div className="col-md-4">
              <label className="form-label">Nom complet</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">E‑mail</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Mot de passe</label>
              <input
                type="password"
                name="password"
                className="form-control"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Rôle</label>
              <select
                name="role"
                className="form-select"
                value={form.role}
                onChange={handleChange}
              >
                <option value="admin">Administrateur simple</option>
                <option value="commercial">Commercial</option>
                <option value="super_admin">Admin suprême</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Login commercial (agent)</label>
              <input
                type="text"
                name="agent_login"
                className="form-control"
                value={form.agent_login}
                onChange={handleChange}
                placeholder="Optionnel, ex: ag123"
              />
            </div>
            <div className="col-12 d-flex justify-content-end">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={creating}
              >
                {creating ? "Création..." : "Créer le compte"}
              </button>
            </div>
          </form>
          {error && <div className="alert alert-danger mt-3">{error}</div>}
        </section>

        <section className="bg-white rounded-xl shadow-sm p-4 md:p-5">
          <h2 className="text-lg font-medium mb-3">Utilisateurs existants</h2>
          {loading ? (
            <p>Chargement des utilisateurs...</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-gray-600">Aucun utilisateur trouvé.</p>
          ) : (
            <div className="table-responsive text-sm">
              <table className="table table-striped align-middle mb-0">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Agent lié</th>
                    <th>Créé le</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>{u.agent_id ? u.agent_id : "-"}</td>
                      <td>
                        {u.created_at
                          ? new Date(u.created_at).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

