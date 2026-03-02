import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "./Sidebar";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import "../styles/Clients.css";
import { api } from "../api/clientflow";

const emptyForm = {
  id: null,
  report_date: "",
  commercial_login: "",
  full_name: "",
  line_number: "",
  phone: "",
  email: "",
  location: "",
  offer: "",
  payer_number: "",
  subscription_date: "",
  installation_date: "",
  payment_reference: "",
  notes: "",
  client_type: "B2C",
};

const deserializeClient = (row) => {
  let meta = {};
  try {
    meta = row.address ? JSON.parse(row.address) : {};
  } catch {
    meta = {};
  }

  return {
    id: row.id,
    full_name: row.full_name,
    phone: row.phone || "",
    email: row.email || "",
    // données issues de la base
    line_number: row.main_line_number || meta.line_number || "",
    // méta éventuelles stockées en JSON dans address
    commercial_login: meta.commercial_login || "",
    location: meta.location || "",
    offer: meta.offer || "",
    payer_number: meta.payer_number || "",
    subscription_date: meta.subscription_date || "",
    installation_date: meta.installation_date || "",
    payment_reference: meta.payment_reference || "",
    notes: meta.notes || "",
    client_type: meta.client_type || "B2C",
    report_date: meta.report_date || "",
  };
};

const buildPayload = (form) => ({
  full_name: form.full_name,
  phone: form.phone,
  email: form.email,
  address: JSON.stringify({
    line_number: form.line_number,
    commercial_login: form.commercial_login,
    location: form.location,
    offer: form.offer,
    payer_number: form.payer_number,
    subscription_date: form.subscription_date,
    installation_date: form.installation_date,
    payment_reference: form.payment_reference,
    notes: form.notes,
    client_type: form.client_type,
    report_date: form.report_date,
  }),
});

function Clients() {
  const [clients, setClients] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.listClients({ page: 1, limit: 200 });
        const data = Array.isArray(res?.data) ? res.data : [];
        const normalized = data.map(deserializeClient);
        setAllClients(normalized);
        setClients(normalized);
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err.message ||
          "Erreur lors du chargement des clients";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredClients = useMemo(() => {
    if (!search) return allClients;
    const q = search.toLowerCase().trim();
    return allClients.filter((client) =>
      (client.line_number || "").toLowerCase().includes(q)
    );
  }, [allClients, search]);

  useEffect(() => {
    setClients(filteredClients);
    if (search.length > 3) {
      const exact = allClients.find(
        (c) => (c.line_number || "").toLowerCase() === search.toLowerCase()
      );
      if (exact) setSelectedClient(exact);
    }
  }, [filteredClients, search, allClients]);

  const deleteClient = async (id) => {
    if (!window.confirm("Supprimer ce client ?")) return;
    try {
      await api.deleteClient(id);
      const updated = allClients.filter((c) => c.id !== id);
      setAllClients(updated);
      setClients(updated);
      if (selectedClient?.id === id) {
        setSelectedClient(null);
      }
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          err.message ||
          "Erreur lors de la suppression du client"
      );
    }
  };

  const saveClient = async () => {
    if (!formData.full_name || !formData.line_number) {
      alert("Nom et Numéro de ligne obligatoires");
      return;
    }

    try {
      const payload = buildPayload(formData);
      let saved;
      if (editing && formData.id) {
        saved = await api.updateClient(formData.id, payload);
      } else {
        saved = await api.createClient(payload);
      }
      const uiClient = deserializeClient(saved);
      const updated = editing
        ? allClients.map((c) => (c.id === uiClient.id ? uiClient : c))
        : [uiClient, ...allClients];
      setAllClients(updated);
      setClients(updated);
      setShowModal(false);
      setSelectedClient(uiClient);
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          err.message ||
          "Erreur lors de l’enregistrement du client"
      );
    }
  };

  return (
    <div className="clients-layout">
      <Sidebar />
      <main className="clients-main-modern">
        <header className="clients-header-modern">
          <div>
            <h1 className="clients-title">Gestion des clients</h1>
            <p className="clients-subtitle">
              Suivez et mettez à jour vos clients en temps réel.
            </p>
          </div>
          <button
            className="create-btn-modern"
            onClick={() => {
              setEditing(false);
              setFormData(emptyForm);
              setShowModal(true);
            }}
          >
            + Nouveau client
          </button>
        </header>

        <section className="clients-toolbar">
          <input
            type="search"
            placeholder="Rechercher par numéro de ligne..."
            className="search-input-modern"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </section>

        {error && <p className="clients-error">{error}</p>}
        {loading ? (
          <p className="clients-loading">Chargement des clients...</p>
        ) : (
          <div className="table-wrapper-modern">
            <table className="clients-table-modern">
              <thead>
                <tr>
                  <th>Commercial</th>
                  <th>Nom</th>
                  <th>Numéro ligne</th>
                  <th>Type</th>
                  <th>Offre</th>
                  <th>Statut</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td>{client.commercial_login || "-"}</td>
                    <td>{client.full_name}</td>
                    <td>{client.line_number}</td>
                    <td>{client.client_type}</td>
                    <td>{client.offer}</td>
                    <td>
                      {client.installation_date ? (
                        <span className="badge installed">Installé</span>
                      ) : (
                        <span className="badge pending">En attente</span>
                      )}
                    </td>
                    <td className="actions-modern">
                      <button
                        className="icon-btn"
                        onClick={() => setSelectedClient(client)}
                        title="Détails"
                      >
                        <VisibilityIcon fontSize="small" />
                      </button>
                      <button
                        className="icon-btn"
                        onClick={() => {
                          setEditing(true);
                          setFormData(client);
                          setShowModal(true);
                        }}
                        title="Modifier"
                      >
                        <EditIcon fontSize="small" />
                      </button>
                      <button
                        className="icon-btn icon-btn-danger"
                        onClick={() => deleteClient(client.id)}
                        title="Supprimer"
                      >
                        <DeleteIcon fontSize="small" />
                      </button>
                    </td>
                  </tr>
                ))}
                {clients.length === 0 && (
                  <tr>
                    <td colSpan={7} className="clients-empty">
                      Aucun client à afficher.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {selectedClient && (
          <aside className="details-panel-modern">
            <div className="details-header">
              <div>
                <h3>{selectedClient.full_name}</h3>
                <p className="details-subtitle">
                  {selectedClient.line_number} ·{" "}
                  {selectedClient.offer || "Offre non renseignée"}
                </p>
              </div>
              <button
                className="details-close"
                onClick={() => setSelectedClient(null)}
              >
                Fermer
              </button>
            </div>

            <div className="details-grid">
              <div>
                <p>
                  <strong>Commercial :</strong>{" "}
                  {selectedClient.commercial_login || "-"}
                </p>
                <p>
                  <strong>Téléphone :</strong>{" "}
                  {selectedClient.phone || "Non renseigné"}
                </p>
                <p>
                  <strong>Email :</strong>{" "}
                  {selectedClient.email || "Non renseigné"}
                </p>
                <p>
                  <strong>Localisation :</strong>{" "}
                  {selectedClient.location || "Non renseignée"}
                </p>
              </div>
              <div>
                <p>
                  <strong>Type :</strong> {selectedClient.client_type}
                </p>
                <p>
                  <strong>Payeur :</strong>{" "}
                  {selectedClient.payer_number || "Non renseigné"}
                </p>
                <p>
                  <strong>Référence paiement :</strong>{" "}
                  {selectedClient.payment_reference || "Non renseignée"}
                </p>
                <p>
                  <strong>Date installation :</strong>{" "}
                  {selectedClient.installation_date || "Non renseignée"}
                </p>
              </div>
              <div className="details-notes">
                <p>
                  <strong>Date souscription :</strong>{" "}
                  {selectedClient.subscription_date || "Non renseignée"}
                </p>
                <p>
                  <strong>Date rapport :</strong>{" "}
                  {selectedClient.report_date || "Non renseignée"}
                </p>
                <p>
                  <strong>Notes :</strong>{" "}
                  {selectedClient.notes || "Aucune note"}
                </p>
              </div>
            </div>
          </aside>
        )}

        {showModal && (
          <div className="modal-overlay">
            <div className="modal large-modal-modern">
              <h3>{editing ? "Modifier le client" : "Nouveau client"}</h3>

              <div className="form-grid-modern">
                <input
                  placeholder="Login commercial"
                  value={formData.commercial_login}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      commercial_login: e.target.value,
                    })
                  }
                />
                <input
                  placeholder="Nom et prénoms"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                />
                <input
                  placeholder="Numéro de ligne"
                  value={formData.line_number}
                  onChange={(e) =>
                    setFormData({ ...formData, line_number: e.target.value })
                  }
                />
                <input
                  placeholder="Téléphone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                <input
                  placeholder="Localisation"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
                <input
                  type="date"
                  value={formData.subscription_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      subscription_date: e.target.value,
                    })
                  }
                />
                <input
                  type="date"
                  value={formData.installation_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      installation_date: e.target.value,
                    })
                  }
                />
                <select
                  value={formData.client_type}
                  onChange={(e) =>
                    setFormData({ ...formData, client_type: e.target.value })
                  }
                >
                  <option value="B2C">B2C</option>
                  <option value="B2B">B2B</option>
                </select>
                <select
                  value={formData.offer}
                  onChange={(e) =>
                    setFormData({ ...formData, offer: e.target.value })
                  }
                >
                  <option value="">Choisir un service</option>
                  <option>20Go Pro</option>
                  <option>Pro 25 Mbps</option>
                  <option>Pro 50 Mbps</option>
                  <option>Pro 80 Mbps</option>
                  <option>Office 150 Mbps</option>
                  <option>Office 200 Mbps</option>
                  <option>Fibre optique</option>
                </select>
                <input
                  placeholder="Payeur (numéro)"
                  value={formData.payer_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      payer_number: e.target.value,
                    })
                  }
                />
                <input
                  placeholder="Référence paiement"
                  value={formData.payment_reference}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      payment_reference: e.target.value,
                    })
                  }
                />
                <input
                  type="date"
                  placeholder="Date rapport"
                  value={formData.report_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      report_date: e.target.value,
                    })
                  }
                />
                <textarea
                  placeholder="Observations"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>

              <div className="modal-buttons-modern">
                <button className="btn-save-modern" onClick={saveClient}>
                  Enregistrer
                </button>
                <button
                  className="btn-cancel-modern"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Clients;
