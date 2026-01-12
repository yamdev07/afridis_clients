import React, { useState } from "react";
import Sidebar from "./Sidebar";

function Services() {
    const [services] = useState([
        {
          id: 1,
          name: "Internet Fibre Optique",
          description: "Connexion haut débit par fibre optique jusqu'à 1 Gbps",
          price: 25000,
          category: "Internet",
          status: "Actif",
          subscribers: 45,
        },
        {
          id: 2,
          name: "Internet ADSL",
          description: "Connexion internet ADSL jusqu'à 20 Mbps",
          price: 15000,
          category: "Internet",
          status: "Actif",
          subscribers: 120,
        },
        {
          id: 3,
          name: "TV Satellite Premium",
          description: "Plus de 200 chaînes HD incluant les chaînes sportives et cinéma",
          price: 12000,
          category: "TV",
          status: "Actif",
          subscribers: 78,
        },
        {
          id: 4,
          name: "TV Satellite Standard",
          description: "Plus de 100 chaînes HD",
          price: 8000,
          category: "TV",
          status: "Actif",
          subscribers: 95,
        },
        {
          id: 5,
          name: "Internet + TV Combo",
          description: "Forfait combiné Internet Fibre + TV Premium",
          price: 32000,
          category: "Combo",
          status: "Actif",
          subscribers: 52,
        },
        {
          id: 6,
          name: "Internet Mobile 4G",
          description: "Connexion internet mobile avec clé 4G",
          price: 10000,
          category: "Internet",
          status: "En développement",
          subscribers: 0,
        },
      ]);

    const stats = {
        total: services.length,
        active: services.filter((s) => s.status === "Actif").length,
        totalSubscribers: services.reduce((sum, s) => sum + s.subscribers, 0),
        totalRevenue: services.reduce((sum, s) => sum + (s.price * s.subscribers), 0),
    };

    const getCategoryBadge = (category) => {
        const colors = {
            "Internet": "primary",
            "TV": "success",
            "Combo": "info",
        };
        return colors[category] || "secondary";
    };

    return (
        <div className="d-flex" style={{ minHeight: '100vh' }}>
            <Sidebar/>

            <main className="flex-grow-1 p-4 bg-light">
                <header className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="h3">Gestion des Services</h1>
                    <span className="badge bg-primary">Admin</span>
                </header>

                {/* Stats */}
                <section className="row g-3 mb-4">
                    <div className="col-md-3">
                        <div className="card shadow-sm border-primary">
                            <div className="card-body">
                                <p className="text-muted mb-1">Total Services</p>
                                <h3 className="mb-0 text-primary">{stats.total}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card shadow-sm border-success">
                            <div className="card-body">
                                <p className="text-muted mb-1">Services Actifs</p>
                                <h3 className="mb-0 text-success">{stats.active}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card shadow-sm border-info">
                            <div className="card-body">
                                <p className="text-muted mb-1">Total Abonnés</p>
                                <h3 className="mb-0 text-info">{stats.totalSubscribers}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card shadow-sm border-warning">
                            <div className="card-body">
                                <p className="text-muted mb-1">Revenus Mensuels</p>
                                <h3 className="mb-0 text-warning">{stats.totalRevenue.toLocaleString()} FCFA</h3>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Actions */}
                <div className="mb-3">
                    <button className="btn btn-primary me-2">
                        <i className="bi bi-plus-circle"></i> Nouveau service
                    </button>
                    <button className="btn btn-outline-secondary">
                        <i className="bi bi-download"></i> Exporter
                    </button>
                </div>

                {/* Services Grid */}
                <section className="row g-3 mb-4">
                    {services.map((service) => (
                        <div key={service.id} className="col-md-6">
                            <div className="card shadow-sm h-100">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <h5 className="card-title">{service.name}</h5>
                                        <span className={`badge bg-${getCategoryBadge(service.category)}`}>
                                            {service.category}
                                        </span>
                                    </div>
                                    <p className="card-text text-muted small">{service.description}</p>
                                    <div className="d-flex justify-content-between align-items-center mt-3">
                                        <div>
                                            <strong className="text-primary">{service.price.toLocaleString()} FCFA</strong>
                                            <span className="text-muted small">/mois</span>
                                        </div>
                                        <div className="text-end">
                                            <div className="small text-muted">Abonnés</div>
                                            <strong>{service.subscribers}</strong>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        {service.status === "Actif" ? (
                                            <span className="badge bg-success">Actif</span>
                                        ) : (
                                            <span className="badge bg-secondary">En développement</span>
                                        )}
                                    </div>
                                    <div className="mt-3">
                                        <button className="btn btn-sm btn-outline-primary me-2">Modifier</button>
                                        <button className="btn btn-sm btn-outline-danger">Supprimer</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>

                {/* Table View */}
                <section className="card shadow-sm">
                    <div className="card-body">
                        <h2 className="h5 mb-3">Vue détaillée des services</h2>
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead className="table-light">
                                    <tr>
                                        <th>Service</th>
                                        <th>Catégorie</th>
                                        <th>Prix</th>
                                        <th>Abonnés</th>
                                        <th>Revenus</th>
                                        <th>Statut</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {services.map((service) => (
                                        <tr key={service.id}>
                                            <td>
                                                <strong>{service.name}</strong>
                                                <br />
                                                <small className="text-muted">{service.description}</small>
                                            </td>
                                            <td>
                                                <span className={`badge bg-${getCategoryBadge(service.category)}`}>
                                                    {service.category}
                                                </span>
                                            </td>
                                            <td>{service.price.toLocaleString()} FCFA</td>
                                            <td>{service.subscribers}</td>
                                            <td><strong>{(service.price * service.subscribers).toLocaleString()} FCFA</strong></td>
                                            <td>
                                                {service.status === "Actif" ? (
                                                    <span className="badge bg-success">Actif</span>
                                                ) : (
                                                    <span className="badge bg-secondary">En développement</span>
                                                )}
                                            </td>
                                            <td>
                                                <button className="btn btn-sm btn-outline-primary me-1">Modifier</button>
                                                <button className="btn btn-sm btn-outline-danger">Supprimer</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Services;