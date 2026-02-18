import React, { useState } from "react";
import Sidebar from "./Sidebar";
import "../styles/Rapports.css";

function Rapports() {
  const [period, setPeriod] = useState("Mensuel");

  const reports = [
    { id: 1, title: "Rapport Revenus", value: "12 500 000 FCFA" },
    { id: 2, title: "Nouvelles Installations", value: 32 },
    { id: 3, title: "Clients Actifs", value: 128 },
  ];

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <Sidebar />

      <main className="flex-grow-1 p-4 bg-light">
        <h1 className="mb-4">Rapports & Statistiques</h1>

        <div className="mb-3">
          <button
            className="btn btn-primary me-2 filter-btn"
            onClick={() => setPeriod("Mensuel")}
          >
            Mensuel
          </button>
          <button
            className="btn btn-success me-2 filter-btn"
            onClick={() => setPeriod("Annuel")}
          >
            Annuel
          </button>
        </div>

        <h5>Période sélectionnée : {period}</h5>

        <div className="row mt-4">
          {reports.map((report) => (
            <div key={report.id} className="col-md-4">
              <div className="card report-card">
                <div className="card-body text-center">
                  <h6>{report.title}</h6>
                  <h3>{report.value}</h3>
                  <button className="btn btn-outline-primary btn-sm mt-3 action-btn">
                    Voir détails
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Rapports;
