import React, { useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import "../styles/Export.css";
import Sidebar from "./Sidebar";
import { api } from "../api/clientflow";

export default function Export() {
  const [filters, setFilters] = useState({
    range: "mois",
    from_date: "",
    to_date: "",
    agent_login: "",
  });
  const [sortBy, setSortBy] = useState("subscription_date_desc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const sortedRows = useMemo(() => {
    const copy = [...rows];
    switch (sortBy) {
      case "subscription_date_asc":
        return copy.sort(
          (a, b) =>
            new Date(a.subscription_date || a.created_at) -
            new Date(b.subscription_date || b.created_at)
        );
      case "amount_desc":
        return copy.sort(
          (a, b) => (b.contract_cost || 0) - (a.contract_cost || 0)
        );
      case "amount_asc":
        return copy.sort(
          (a, b) => (a.contract_cost || 0) - (b.contract_cost || 0)
        );
      case "subscription_date_desc":
      default:
        return copy.sort(
          (a, b) =>
            new Date(b.subscription_date || b.created_at) -
            new Date(a.subscription_date || a.created_at)
        );
    }
  }, [rows, sortBy]);

  const handleFetch = async () => {
    setError("");
    setLoading(true);
    try {
      const params = {
        limit: 1000,
        agent_login: filters.agent_login || undefined,
        from_date: filters.from_date || undefined,
        to_date: filters.to_date || undefined,
      };
      const data = await api.listSubscriptions(params);
      setRows(data?.data || []);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Erreur lors du chargement des données";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!sortedRows.length) return;
    const doc = new jsPDF();
    let y = 10;
    const header = `Ventes${
      filters.agent_login ? ` – ${filters.agent_login}` : ""
    }`;
    doc.text(header, 10, y);
    y += 8;
    if (filters.from_date || filters.to_date) {
      doc.text(
        `Période: ${filters.from_date || "?"} -> ${
          filters.to_date || "?"
        }`,
        10,
        y
      );
      y += 8;
    }

    sortedRows.forEach((row) => {
      if (y > 280) {
        doc.addPage();
        y = 10;
      }
      const line = `${row.subscription_date || row.created_at} | ${
        row.agent_login || "-"
      } | ${row.client_name} | ${row.service_label} | ${
        row.contract_cost ?? "-"
      }`;
      doc.text(line, 10, y);
      y += 6;
    });
    doc.save("ventes.pdf");
  };

  const handleExportExcel = () => {
    if (!sortedRows.length) return;
    const worksheetData = sortedRows.map((row) => ({
      Date: row.subscription_date || row.created_at,
      Commercial: row.agent_login || "",
      Client: row.client_name,
      Téléphone: row.client_phone || "",
      Email: row.client_email || "",
      Service: row.service_label,
      Statut: row.status_label,
      "Numéro de ligne": row.line_number || "",
      "Montant contrat": row.contract_cost ?? "",
      Notes: row.notes || "",
    }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ventes");
    XLSX.writeFile(workbook, "ventes.xlsx");
  };

  return (
    <div className="d-flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-grow-1 p-4 md:p-6">
        <h2 className="text-2xl font-semibold mb-4">Export des ventes</h2>

        <div className="bg-white rounded-xl shadow-sm p-4 md:p-5 mb-4 space-y-3">
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="form-label mb-1 text-sm font-medium">
                Commercial (login)
              </label>
              <input
                type="text"
                name="agent_login"
                value={filters.agent_login}
                onChange={handleChange}
                className="form-control"
                placeholder="ex: ag123"
              />
            </div>
            <div>
              <label className="form-label mb-1 text-sm font-medium">
                Date début
              </label>
              <input
                type="date"
                name="from_date"
                value={filters.from_date}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div>
              <label className="form-label mb-1 text-sm font-medium">
                Date fin
              </label>
              <input
                type="date"
                name="to_date"
                value={filters.to_date}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div className="flex items-center gap-2">
              <label className="form-label mb-0 text-sm font-medium">
                Tri
              </label>
              <select
                className="form-select w-auto"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="subscription_date_desc">
                  Date de souscription (récent d&apos;abord)
                </option>
                <option value="subscription_date_asc">
                  Date de souscription (ancien d&apos;abord)
                </option>
                <option value="amount_desc">
                  Montant du contrat (décroissant)
                </option>
                <option value="amount_asc">
                  Montant du contrat (croissant)
                </option>
              </select>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleFetch}
              disabled={loading}
            >
              {loading ? "Chargement..." : "Appliquer les filtres"}
            </button>
          </div>

          {error && <div className="alert alert-danger mt-2">{error}</div>}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 md:p-5 mb-4">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <p className="mb-0 text-sm text-gray-600">
              <span className="font-medium">{sortedRows.length}</span>{" "}
              lignes prêtes à être exportées.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                className="btn btn-outline-secondary"
                onClick={handleExportPDF}
                disabled={!sortedRows.length}
              >
                Exporter en PDF
              </button>
              <button
                className="btn btn-success"
                onClick={handleExportExcel}
                disabled={!sortedRows.length}
              >
                Exporter en Excel
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}