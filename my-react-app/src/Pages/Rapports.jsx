import React, { useState } from "react";
import Sidebar from "./Sidebar";

function Rapports() {
    const [selectedPeriod, setSelectedPeriod] = useState("mois");

    const reports = {
        revenue: {
            mois: 1250000,
            trimestre: 3750000,
            annee: 15000000,
        },
        clients: {
            nouveaux: 12,
            total: 390,
            actifs: 345,
        },
        services: {
            internet: 245,
            tv: 173,
            combo: 98,
        },
        installations: {
            reussies: 28,
            enAttente: 5,
            echecs: 2,
        },
    };

    const recentActivity = [
        {
            id: 1,
            type: "Nouveau client",
            description: "Jean Dupont a souscrit au service Internet Fibre",
            date: "2024-03-15",
            time: "10:30",
        },
        {
            id: 2,
            type: "Installation",
            description: "Installation réussie pour Marie Koffi",
            date: "2024-03-15",
            time: "14:20",
        },
        {
            id: 3,
            type: "Paiement",
            description: "Paiement reçu de Paul Mensah - 25,000 FCFA",
            date: "2024-03-14",
            time: "16:45",
        },
        {
            id: 4,
            type: "Service",
            description: "Nouveau service TV Premium ajouté",
            date: "2024-03-14",
            time: "09:15",
        },
        {
            id: 5,
            type: "Client",
            description: "Sophie Kouassi a mis à jour son profil",
            date: "2024-03-13",
            time: "11:30",
        },
    ];

    const getRevenue = () => {
        return reports.revenue[selectedPeriod] || reports.revenue.mois;
    };

    return (
        <div className="d-flex" style={{ minHeight: '100vh' }}>
            <Sidebar/>

            <main className="flex-grow-1 p-4 bg-light">
                <header className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="h3">Rapports et Statistiques</h1>
                    <div className="d-flex align-items-center gap-2">
                        <select 
                            className="form-select form-select-sm"
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            style={{ width: 'auto' }}
                        >
                            <option value="mois">Ce mois</option>
                            <option value="trimestre">Ce trimestre</option>
                            <option value="annee">Cette année</option>
                        </select>
                        <span className="badge bg-primary">Admin</span>
                    </div>
                </header>

                {/* Revenue Stats */}
                <section className="row g-3 mb-4">
                    <div className="col-md-4">
                        <div className="card shadow-sm border-primary">
                            <div className="card-body">
                                <p className="text-muted mb-1">Revenus ({selectedPeriod})</p>
                                <h3 className="mb-0 text-primary">{getRevenue().toLocaleString()} FCFA</h3>
                                <small className="text-success">
                                    <i className="bi bi-arrow-up"></i> +12% vs période précédente
                                </small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card shadow-sm border-success">
                            <div className="card-body">
                                <p className="text-muted mb-1">Clients Actifs</p>
                                <h3 className="mb-0 text-success">{reports.clients.actifs}</h3>
                                <small className="text-muted">sur {reports.clients.total} total</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card shadow-sm border-info">
                            <div className="card-body">
                                <p className="text-muted mb-1">Nouveaux Clients</p>
                                <h3 className="mb-0 text-info">{reports.clients.nouveaux}</h3>
                                <small className="text-success">
                                    <i className="bi bi-arrow-up"></i> +8% ce mois
                                </small>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Services Distribution */}
                <section className="row g-3 mb-4">
                    <div className="col-md-4">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title">Services Internet</h5>
                                <h2 className="text-primary">{reports.services.internet}</h2>
                                <div className="progress mt-2" style={{ height: '8px' }}>
                                    <div 
                                        className="progress-bar bg-primary" 
                                        role="progressbar" 
                                        style={{ width: '70%' }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title">Services TV</h5>
                                <h2 className="text-success">{reports.services.tv}</h2>
                                <div className="progress mt-2" style={{ height: '8px' }}>
                                    <div 
                                        className="progress-bar bg-success" 
                                        role="progressbar" 
                                        style={{ width: '50%' }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title">Forfaits Combo</h5>
                                <h2 className="text-info">{reports.services.combo}</h2>
                                <div className="progress mt-2" style={{ height: '8px' }}>
                                    <div 
                                        className="progress-bar bg-info" 
                                        role="progressbar" 
                                        style={{ width: '28%' }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Installations */}
                <section className="row g-3 mb-4">
                    <div className="col-md-4">
                        <div className="card shadow-sm border-success">
                            <div className="card-body text-center">
                                <h5 className="text-muted">Installations Réussies</h5>
                                <h2 className="text-success">{reports.installations.reussies}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card shadow-sm border-warning">
                            <div className="card-body text-center">
                                <h5 className="text-muted">En Attente</h5>
                                <h2 className="text-warning">{reports.installations.enAttente}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card shadow-sm border-danger">
                            <div className="card-body text-center">
                                <h5 className="text-muted">Échecs</h5>
                                <h2 className="text-danger">{reports.installations.echecs}</h2>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Actions */}
                <div className="mb-3">
                    <button className="btn btn-primary me-2">
                        <i className="bi bi-download"></i> Exporter PDF
                    </button>
                    <button className="btn btn-outline-primary me-2">
                        <i className="bi bi-file-earmark-excel"></i> Exporter Excel
                    </button>
                    <button className="btn btn-outline-secondary">
                        <i className="bi bi-printer"></i> Imprimer
                    </button>
                </div>

                {/* Recent Activity */}
                <section className="card shadow-sm">
                    <div className="card-body">
                        <h2 className="h5 mb-3">Activité Récente</h2>
                        <div className="list-group">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="list-group-item">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div className="flex-grow-1">
                                            <h6 className="mb-1">
                                                <span className={`badge bg-${
                                                    activity.type === "Nouveau client" ? "primary" :
                                                    activity.type === "Installation" ? "success" :
                                                    activity.type === "Paiement" ? "info" :
                                                    "secondary"
                                                } me-2`}>
                                                    {activity.type}
                                                </span>
                                                {activity.description}
                                            </h6>
                                            <small className="text-muted">
                                                {activity.date} à {activity.time}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Rapports;
