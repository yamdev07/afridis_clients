import { useState } from "react";
import Sidebar from './Sidebar'

export default function Dashboard() {
  const [clients] = useState([
    {
      id: 1,
      name: "Jean Dupont",
      phone: "97000000",
      internet: true,
      tv: false,
      subscription: "2024-01-10",
      installed: false,
    },
    {
      id: 2,
      name: "Marie Koffi",
      phone: "96000000",
      internet: true,
      tv: true,
      subscription: "2024-01-05",
      installed: true,
    },
    {
      id: 3,
      name: "Paul Mensah",
      phone: "98000000",
      internet: false,
      tv: true,
      subscription: "2024-02-01",
      installed: true,
    },
  ]);

  const stats = {
    total: clients.length,
    installed: clients.filter((c) => c.installed).length,
    internet: clients.filter((c) => c.internet).length,
    tv: clients.filter((c) => c.tv).length,
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <Sidebar />
      
      <main className="flex-grow-1 p-4 bg-light">
        <header className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3">Gestion Clientèle</h1>
          <span className="badge bg-primary">Admin</span>
        </header>

        {/* Stats */}
        <section className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card shadow-sm">
              <div className="card-body">
                <p className="text-muted mb-1">Total Clients</p>
                <h3 className="mb-0">{stats.total}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card shadow-sm">
              <div className="card-body">
                <p className="text-muted mb-1">Installés</p>
                <h3 className="mb-0">{stats.installed}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card shadow-sm">
              <div className="card-body">
                <p className="text-muted mb-1">Internet</p>
                <h3 className="mb-0">{stats.internet}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card shadow-sm">
              <div className="card-body">
                <p className="text-muted mb-1">TV</p>
                <h3 className="mb-0">{stats.tv}</h3>
              </div>
            </div>
          </div>
        </section>

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
                    <th>Services</th>
                    <th>Souscription</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id}>
                      <td>{client.name}</td>
                      <td>{client.phone}</td>
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
