import React, { useState } from "react";
import Sidebar from "./Sidebar";
import "../styles/Rapports.css";

function Rapports() {
  const [period, setPeriod] = useState("Mensuel");
  const [range, setRange] = useState("mois");
  const [selectedReport, setSelectedReport] = useState(null);

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

        <div className="mb-3 d-flex flex-wrap align-items-center gap-2">
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

          <select
            className="form-select w-auto"
            value={range}
            onChange={(e) => setRange(e.target.value)}
          >
            <option value="mois">Dernier mois</option>
            <option value="trimestre">Dernier trimestre</option>
            <option value="annee">Dernière année</option>
          </select>
        </div>

        <h5>
          Période sélectionnée : {period} –{" "}
          {range === "mois"
            ? "1 mois"
            : range === "trimestre"
            ? "1 trimestre"
            : "1 an"}
        </h5>

        <div className="row mt-4">
          {reports.map((report) => (
            <div key={report.id} className="col-md-4">
              <div className="card report-card">
                <div className="card-body text-center">
                  <h6>{report.title}</h6>
                  <h3>{report.value}</h3>
                  <button
                    className="btn btn-outline-primary btn-sm mt-3 action-btn"
                    onClick={() => setSelectedReport(report)}
                  >
                    Voir détails
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedReport && (
          <div className="card mt-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="card-title mb-0">Détails : {selectedReport.title}</h5>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setSelectedReport(null)}
                >
                  Fermer
                </button>
              </div>
              <p className="text-muted mb-2">
                Période : {period} –{" "}
                {range === "mois"
                  ? "dernier mois"
                  : range === "trimestre"
                  ? "dernier trimestre"
                  : "dernière année"}
              </p>
              <p>
                Ceci représente un exemple de détail de rapport. Quand le backend sera prêt,
                cette section pourra afficher une liste détaillée (par jour, semaine, client,
                etc.) pour le rapport sélectionné.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Rapports;
