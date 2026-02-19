import React, { useState } from "react";
import Sidebar from "./Sidebar";
import "../styles/Services.css";

function Services() {
  const [services, setServices] = useState([
    {
      id: 1,
      name: "Création Email Professionnel",
      description: "Création et configuration d'adresses emails professionnelles sécurisées",
      price: 5000,
      category: "Digital",
      status: "Actif",
      subscribers: 35,
    },
    {
      id: 2,
      name: "Création Site Web",
      description: "Développement de sites web modernes et optimisés SEO",
      price: 150000,
      category: "Digital",
      status: "Actif",
      subscribers: 12,
    },
    {
      id: 3,
      name: "Application Mobile",
      description: "Développement d'applications Android & iOS",
      price: 350000,
      category: "Digital",
      status: "Actif",
      subscribers: 8,
    },
    {
      id: 4,
      name: "Installation Internet Entreprise",
      description: "Installation et configuration internet pour entreprises",
      price: 75000,
      category: "Internet",
      status: "Actif",
      subscribers: 40,
    },
    {
      id: 5,
      name: "Installation Fibre Optique",
      description: "Installation fibre internet haut débit",
      price: 120000,
      category: "Internet",
      status: "En cours",
      subscribers: 22,
    },
  ]);

  const [search, setSearch] = useState("");
  const [selectedService, setSelectedService] = useState(null);

  const mockSubscribers = [
    {
      id: 1,
      name: "Entreprise Alpha",
      subscriptionDate: "2024-01-10",
      amount: 150000,
      contact: "alpha@clientflow.test",
    },
    {
      id: 2,
      name: "Client Bêta",
      subscriptionDate: "2024-02-05",
      amount: 50000,
      contact: "beta@clientflow.test",
    },
    {
      id: 3,
      name: "Société Gamma",
      subscriptionDate: "2024-03-21",
      amount: 250000,
      contact: "gamma@clientflow.test",
    },
  ];

  const deleteService = (id) => {
    setServices(services.filter((s) => s.id !== id));
  };

  const toggleStatus = (id) => {
    setServices(
      services.map((s) =>
        s.id === id
          ? { ...s, status: s.status === "Actif" ? "Suspendu" : "Actif" }
          : s
      )
    );
  };

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = services.reduce(
    (sum, s) => sum + s.price * s.subscribers,
    0
  );

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <Sidebar />

      <main className="flex-grow-1 p-4 bg-light">
        <h1 className="mb-4">Gestion des Services</h1>

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
          <div>Total Services : {services.length}</div>
          <div>Revenus Totaux : {totalRevenue.toLocaleString()} FCFA</div>
        </div>

        {/* Services */}
        <div className="row">
          {filteredServices.map((service) => (
            <div key={service.id} className="col-md-6 mb-4">
              <div
                className="card service-card"
                onClick={() => setSelectedService(service)}
                style={{ cursor: "pointer" }}
              >
                <div className="card-body">
                  <h5>{service.name}</h5>
                  <p>{service.description}</p>

                  <p>
                    <strong>{service.price.toLocaleString()} FCFA</strong>
                  </p>

                  <span
                    className={`badge ${
                      service.status === "Actif"
                        ? "bg-success"
                        : "bg-secondary"
                    }`}
                  >
                    {service.status}
                  </span>

                  <div className="mt-3 d-flex gap-2">
                    <button
                      className="btn btn-sm btn-warning action-btn"
                      onClick={() => toggleStatus(service.id)}
                    >
                      Activer / Suspendre
                    </button>

                    <button
                      className="btn btn-sm btn-danger action-btn"
                      onClick={() => deleteService(service.id)}
                    >
                      Supprimer
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
                    Clients abonnés à {selectedService.name}
                  </h5>
                  <small className="text-muted">
                    Détail des souscriptions (exemple de données)
                  </small>
                </div>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setSelectedService(null)}
                >
                  Fermer
                </button>
              </div>

              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Date d'abonnement</th>
                      <th>Montant</th>
                      <th>Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockSubscribers.map((sub) => (
                      <tr key={sub.id}>
                        <td>{sub.name}</td>
                        <td>{sub.subscriptionDate}</td>
                        <td>{sub.amount.toLocaleString()} FCFA</td>
                        <td>{sub.contact}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Services;
