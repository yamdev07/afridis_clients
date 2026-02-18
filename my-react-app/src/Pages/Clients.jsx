import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import "../styles/Clients.css";

const generateFakeClients = (count) => {
  const offers = [
    "20Go Pro",
    "Pro 25 Mbps",
    "Pro 50 Mbps",
    "Pro 80 Mbps",
    "Office 150 Mbps",
    "Office 200 Mbps",
    "Fibre optique"
  ];

  const types = ["B2C", "B2B"];

  return Array.from({ length: count }, (_, i) => ({
    id: Date.now() + i,
    report_date: "2024-01-01",
    commercial_login: "COM" + (100 + i),
    full_name: "Client Test " + i,
    line_number: "0700" + (100000 + i),
    phone: "0700" + (100000 + i),
    email: `client${i}@example.com`,
    location: "Abidjan",
    offer: offers[Math.floor(Math.random() * offers.length)],
    payer_number: "0700" + (200000 + i),
    subscription_date: "2024-01-01",
    installation_date: Math.random() > 0.5 ? "2024-01-10" : "",
    payment_reference: "PAY" + i,
    notes: "Client généré automatiquement",
    client_type: types[Math.floor(Math.random() * types.length)]
  }));
};


function Clients() {

  const [clients, setClients] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  

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
  
  
  const [formData, setFormData] = useState(emptyForm);

  /* ===================== */
  /* 🔹 INITIAL LOAD */
  /* ===================== */

  useEffect(() => {
  const stored = JSON.parse(localStorage.getItem("clients"));

  if (stored && stored.length > 0) {
    setAllClients(stored);
    setClients(stored);
  } else {
    const fakeData = generateFakeClients(200);
    localStorage.setItem("clients", JSON.stringify(fakeData));
    setAllClients(fakeData);
    setClients(fakeData);
  }
}, []);


  /* ===================== */
  /* 🔹 SEARCH */
  /* ===================== */

  useEffect(() => {
    const filtered = allClients.filter((client) =>
      client.line_number.toLowerCase().includes(search.toLowerCase())
    );

    setClients(filtered);

    if (search.length > 3) {
      const exact = allClients.find(
        (c) => c.line_number.toLowerCase() === search.toLowerCase()
      );
      if (exact) setSelectedClient(exact);
    }

  }, [search, allClients]);

  /* ===================== */
  /* 🔹 DELETE */
  /* ===================== */

  const deleteClient = (id) => {
    if (!window.confirm("Supprimer ce client ?")) return;

    const updated = allClients.filter((c) => c.id !== id);
    localStorage.setItem("clients", JSON.stringify(updated));
    setAllClients(updated);
  };

  /* ===================== */
  /* 🔹 SAVE */
  /* ===================== */

  const saveClient = () => {
    if (!formData.full_name || !formData.line_number) {
      alert("Nom et Numéro de ligne obligatoires");
      return;
    }

    let updated;

    if (editing) {
      updated = allClients.map((c) =>
        c.id === formData.id ? formData : c
      );
    } else {
      updated = [...allClients, { ...formData, id: Date.now() }];
    }

    localStorage.setItem("clients", JSON.stringify(updated));
    setAllClients(updated);
    setShowModal(false);
  };

  /* ===================== */
  /* 🔹 UI */
  /* ===================== */

  return (
    <div className="clients-container">
      <Sidebar />

      <main className="clients-main">
        <div className="clients-header">
          <h1>Clients</h1>

          <button className="create-btn" onClick={() => {
            setEditing(false);
            setFormData(emptyForm);
            setShowModal(true);
          }}>
            + Nouveau Client
          </button>
        </div>

        <input
          type="search"
          placeholder="Rechercher par numéro de ligne..."
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="table-wrapper">
          <table className="clients-table">
            <thead>
              <tr>
                <th>Commercial</th>
                <th>Nom</th>
                <th>Numéro Ligne</th>
                <th>Type</th>
                <th>Offre</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {clients.map((client) => (
                <tr key={client.id}>
                  <td>{client.commercial_login}</td>
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

                  <td className="actions">
                    <button onClick={() => setSelectedClient(client)}>
                      <VisibilityIcon />
                    </button>

                    <button onClick={() => {
                      setEditing(true);
                      setFormData(client);
                      setShowModal(true);
                    }}>
                      <EditIcon />
                    </button>

                    <button onClick={() => deleteClient(client.id)}>
                      <DeleteIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

        {/* DETAILS PANEL */}
        {selectedClient && (
          <div className="details-panel">
            <h3>{selectedClient.full_name}</h3>

            <p><strong>Date rapport :</strong> {selectedClient.report_date}</p>
            <p><strong>Ligne :</strong> {selectedClient.line_number}</p>
            <p><strong>Téléphone :</strong> {selectedClient.phone}</p>
            <p><strong>Email :</strong> {selectedClient.email}</p>
            <p><strong>Localisation :</strong> {selectedClient.location}</p>
            <p><strong>Offre :</strong> {selectedClient.offer}</p>
            <p><strong>Payeur :</strong> {selectedClient.payer_number}</p>
            <p><strong>Référence :</strong> {selectedClient.payment_reference}</p>
            <p><strong>Date installation :</strong> {selectedClient.installation_date}</p>
            <p><strong>Commercial :</strong> {selectedClient.commercial_login}</p>
            <p><strong>Type :</strong> {selectedClient.client_type}</p>
            <p><strong>Date souscription :</strong> {selectedClient.subscription_date}</p>
            <p><strong>Notes :</strong> {selectedClient.notes}</p>

            <button onClick={() => setSelectedClient(null)}>
              Fermer
            </button>
          </div>
        )}

        {/* MODAL FORM */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal large-modal">
              <h3>{editing ? "Modifier Client" : "Nouveau Client"}</h3>

              <div className="form-grid">

                <input
                  placeholder="Login Commercial"
                  value={formData.commercial_login}
                  onChange={(e) =>
                    setFormData({ ...formData, commercial_login: e.target.value })
                  }
                />

                <input
                  placeholder="Nom et Prénoms"
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
                  type="date"
                  value={formData.subscription_date}
                  onChange={(e) =>
                    setFormData({ ...formData, subscription_date: e.target.value })
                  }
                />

                <input
                  type="date"
                  value={formData.installation_date}
                  onChange={(e) =>
                    setFormData({ ...formData, installation_date: e.target.value })
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

                <textarea
                  placeholder="Observations"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />

              </div>


              <div className="modal-buttons">
                <button className="btn-save" onClick={saveClient}>
                  Enregistrer
                </button>

                <button
                  className="btn-cancel"
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
