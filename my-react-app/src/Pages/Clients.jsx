import React, { useState } from "react";
import Sidebar from "./Sidebar";

function Clients() {
    const [clients] = useState([
        {
          id: 1,
          name: "Jean Dupont",
          phone: "97000000",
          email: "jean.dupont@email.com",
          address: "Abidjan, Cocody",
          internet: true,
          tv: false,
          subscription: "2024-01-10",
          installed: false,
        },
        {
          id: 2,
          name: "Marie Koffi",
          phone: "96000000",
          email: "marie.koffi@email.com",
          address: "Abidjan, Yopougon",
          internet: true,
          tv: true,
          subscription: "2024-01-05",
          installed: true,
        },
        {
          id: 3,
          name: "Paul Mensah",
          phone: "98000000",
          email: "paul.mensah@email.com",
          address: "Abidjan, Marcory",
          internet: false,
          tv: true,
          subscription: "2024-02-01",
          installed: true,
        },
        {
          id: 4,
          name: "Sophie Kouassi",
          phone: "95000000",
          email: "sophie.kouassi@email.com",
          address: "Abidjan, Plateau",
          internet: true,
          tv: true,
          subscription: "2024-02-15",
          installed: true,
        },
        {
          id: 5,
          name: "Amadou Diallo",
          phone: "94000000",
          email: "amadou.diallo@email.com",
          address: "Abidjan, Adjamé",
          internet: true,
          tv: false,
          subscription: "2024-03-01",
          installed: false,
        },
      ]);
    
      const stats = {
        total: clients.length,
        installed: clients.filter((c) => c.installed).length,
        pending: clients.filter((c) => !c.installed).length,
        internet: clients.filter((c) => c.internet).length,
        tv: clients.filter((c) => c.tv).length,
      };

    return (
        <div className="d-flex" style={{ minHeight: '100vh' }}>
            <Sidebar/>

            <main className="flex-grow-1 p-4 bg-light">
                <header className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="h3">Suivi clientèle</h1>
                    <span className="badge bg-primary">Admin</span>
                </header>

                {/* Stats */}
                <section className="row g-3 mb-4">
                    <div className="col-md-3">
                        <div className="card shadow-sm border-primary">
                            <div className="card-body">
                                <p className="text-muted mb-1">Total Clients</p>
                                <h3 className="mb-0 text-primary">{stats.total}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card shadow-sm border-success">
                            <div className="card-body">
                                <p className="text-muted mb-1">Installés</p>
                                <h3 className="mb-0 text-success">{stats.installed}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card shadow-sm border-warning">
                            <div className="card-body">
                                <p className="text-muted mb-1">En attente</p>
                                <h3 className="mb-0 text-warning">{stats.pending}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card shadow-sm border-info">
                            <div className="card-body">
                                <p className="text-muted mb-1">Services actifs</p>
                                <h3 className="mb-0 text-info">{stats.internet + stats.tv}</h3>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Actions */}
                <div className="mb-3">
                    <button className="btn btn-primary me-2">
                        <i className="bi bi-plus-circle"></i> Nouveau client
                    </button>
                    <button className="btn btn-outline-secondary">
                        <i className="bi bi-download"></i> Exporter
                    </button>
                </div>

                {/* Table */}
                <section className="card shadow-sm">
                    <div className="card-body">
                        <h2 className="h5 mb-3">Liste des clients</h2>
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead className="table-light">
                                    <tr>
                                        <th>Nom</th>
                                        <th>Téléphone</th>
                                        <th>Email</th>
                                        <th>Adresse</th>
                                        <th>Services</th>
                                        <th>Souscription</th>
                                        <th>Statut</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clients.map((client) => (
                                        <tr key={client.id}>
                                            <td><strong>{client.name}</strong></td>
                                            <td>{client.phone}</td>
                                            <td>{client.email}</td>
                                            <td>{client.address}</td>
                                            <td>
                                                {client.internet && (
                                                    <span className="badge bg-primary me-1">Internet</span>
                                                )}
                                                {client.tv && (
                                                    <span className="badge bg-success">TV</span>
                                                )}
                                            </td>
                                            <td>{client.subscription}</td>
                                            <td>
                                                {client.installed ? (
                                                    <span className="badge bg-success">Installé</span>
                                                ) : (
                                                    <span className="badge bg-warning text-dark">En attente</span>
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

export default Clients;