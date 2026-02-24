import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "./Sidebar";
import "../styles/Services.css";
import { api } from "../api/clientflow";

function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [serviceClients, setServiceClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientsError, setClientsError] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await api.listServices();
        setServices(data?.data || []);
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err.message ||
          "Erreur lors du chargement des services";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleShowClients = async (service) => {
    setSelectedService(service);
    setClientsLoading(true);
    setClientsError("");
    try {
      const data = await api.getServiceClients(service.id);
      setServiceClients(data?.data || []);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Erreur lors du chargement des clients";
      setClientsError(message);
      setServiceClients([]);
    } finally {
      setClientsLoading(false);
    }
  };

  const filteredServices = useMemo(
    () =>
      services.filter((service) =>
        (service.label || "")
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [services, search]
  );

  const totalRevenue = useMemo(
    () =>
      filteredServices.reduce(
        (sum, s) => sum + ( Number(s.monthly_price || 0) ),
        0
      ),
    [filteredServices]
  );

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <Sidebar />

      <main className="flex-grow-1 p-4 bg-light">
        <h1 className="mb-4">Gestion des Services</h1>

        {error && <div className="alert alert-danger mb-3">{error}</div>}

        {/* Search */}
        <input
          type="text"
          placeholder="Rechercher un service..."
          className="form-control mb-4 search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Stats */}
        <div className="stats-box">
          <div>Total Services : {filteredServices.length}</div>
          <div>
            Prix mensuel total (approx.) :{" "}
            {totalRevenue.toLocaleString("fr-FR")} FCFA
          </div>
        </div>

        {loading ? (
          <p>Chargement des services...</p>
        ) : (
          <>
            {/* Services */}
            <div className="row">
              {filteredServices.map((service) => (
                <div key={service.id} className="col-md-6 mb-4">
                  <div className="card service-card">
                    <div className="card-body">
                      <h5>{service.label}</h5>
                      <p>{service.description}</p>

                      <p>
                        <strong>
                          {(service.monthly_price || 0).toLocaleString(
                            "fr-FR"
                          )}{" "}
                          FCFA / mois
                        </strong>
                      </p>

                      <span
                        className={`badge ${
                          service.is_active ? "bg-success" : "bg-secondary"
                        }`}
                      >
                        {service.is_active ? "Actif" : "Inactif"}
                      </span>

                      <div className="mt-3 d-flex gap-2 flex-wrap">
                        <button
                          className="btn btn-sm btn-outline-primary action-btn"
                          onClick={() => handleShowClients(service)}
                        >
                          Voir les clients
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedService && (
              <div className="card mt-4">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h5 className="mb-1">
                        Clients abonnés à {selectedService.label}
                      </h5>
                      <small className="text-muted">
                        Liste des souscriptions pour ce service
                      </small>
                    </div>
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => {
                        setSelectedService(null);
                        setServiceClients([]);
                      }}
                    >
                      Fermer
                    </button>
                  </div>

                  {clientsError && (
                    <div className="alert alert-danger mb-2">
                      {clientsError}
                    </div>
                  )}

                  {clientsLoading ? (
                    <p>Chargement des clients...</p>
                  ) : serviceClients.length === 0 ? (
                    <p className="text-muted">
                      Aucun client n&apos;a encore souscrit à ce service.
                    </p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Client</th>
                            <th>Commercial</th>
                            <th>Date d&apos;abonnement</th>
                            <th>Montant</th>
                            <th>Numéro de ligne</th>
                            <th>Statut</th>
                            <th>Contact</th>
                          </tr>
                        </thead>
                        <tbody>
                          {serviceClients.map((sub) => (
                            <tr key={sub.subscription_id}>
                              <td>{sub.full_name}</td>
                              <td>{sub.agent_login || "-"}</td>
                              <td>{sub.subscription_date || "-"}</td>
                              <td>
                                {(sub.contract_cost || 0).toLocaleString(
                                  "fr-FR"
                                )}{" "}
                                FCFA
                              </td>
                              <td>{sub.line_number || "-"}</td>
                              <td>{sub.status_label}</td>
                              <td>
                                {sub.email || sub.phone
                                  ? `${sub.email || ""} ${
                                      sub.phone ? `(${sub.phone})` : ""
                                    }`
                                  : "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default Services;
