import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import jsPDF from 'jspdf';
import "../styles/Export.css";
import Sidebar from './Sidebar';

export default  function Export ({ data = {} })  {
  const [range, setRange] = useState("mois");

  const handleExport = () => {
    const doc = new jsPDF();
    let y = 10;
    const header = `Période: ${
      range === "mois" ? "dernier mois" : range === "trimestre" ? "dernier trimestre" : "dernière année"
    }`;
    doc.text(header, 10, y);
    y += 10;
    Object.entries(data).forEach(([key, value]) => {
      doc.text(`${key}: ${value}`, 10, y);
      y += 10;
    });
    doc.save('exported_data.pdf');
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <Sidebar/>
      <main className="flex-grow-1 p-4 bg-light">
        <h2 className="mb-3">Export des rapports</h2>
        <div className="mb-3 d-flex flex-wrap align-items-center gap-2">
          <label className="form-label mb-0">Période :</label>
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
        <button className="btn btn-primary" onClick={handleExport}>
          Exporter au format PDF
        </button>
      </main>
    </div>
  );
};

// Example usage: <FileExport data={{report_date: '2023-01-01', ...}} />