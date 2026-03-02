import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import pdfToText from "react-pdftotext";
import * as XLSX from "xlsx";
import "../styles/Import.css";
import Sidebar from "./Sidebar";
import { api } from "../api/clientflow";

export default function Import() {
  const [extractedData, setExtractedData] = useState({
    report_date: "",
    commercial_login: "",
    full_name: "",
    line_number: "",
    phone: "",
    email: "",
    location: "",
    offer: "",
    payer_number: "",
    subscription_date: "",
    installation_date: "",
    payment_reference: "",
    notes: "",
    client_type: "B2C",
  });
  const [pdfError, setPdfError] = useState("");

  const [excelRows, setExcelRows] = useState([]);
  const [excelError, setExcelError] = useState("");
  const [excelResult, setExcelResult] = useState(null);
  const [excelLoading, setExcelLoading] = useState(false);

  const handlePdfChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      pdfToText(file)
        .then((text) => {
          const data = {
            report_date:
              text.match(/report_date:\s*([^\n]+)/i)?.[1]?.trim() || "",
            commercial_login:
              text.match(/commercial_login:\s*([^\n]+)/i)?.[1]?.trim() || "",
            full_name:
              text.match(/full_name:\s*([^\n]+)/i)?.[1]?.trim() || "",
            line_number:
              text.match(/line_number:\s*([^\n]+)/i)?.[1]?.trim() || "",
            phone: text.match(/phone:\s*([^\n]+)/i)?.[1]?.trim() || "",
            email: text.match(/email:\s*([^\n]+)/i)?.[1]?.trim() || "",
            location: text.match(/location:\s*([^\n]+)/i)?.[1]?.trim() || "",
            offer: text.match(/offer:\s*([^\n]+)/i)?.[1]?.trim() || "",
            payer_number:
              text.match(/payer_number:\s*([^\n]+)/i)?.[1]?.trim() || "",
            subscription_date:
              text.match(/subscription_date:\s*([^\n]+)/i)?.[1]?.trim() || "",
            installation_date:
              text.match(/installation_date:\s*([^\n]+)/i)?.[1]?.trim() || "",
            payment_reference:
              text.match(/payment_reference:\s*([^\n]+)/i)?.[1]?.trim() || "",
            notes: text.match(/notes:\s*([^\n]+)/i)?.[1]?.trim() || "",
            client_type:
              text.match(/client_type:\s*([^\n]+)/i)?.[1]?.trim() || "B2C",
          };
          setExtractedData(data);
          setPdfError("");
        })
        .catch((err) => {
          console.error("Failed to extract text from PDF:", err);
          setPdfError("Échec de l'extraction du texte du PDF.");
        });
    } else {
      setPdfError("Veuillez importer un fichier PDF valide.");
    }
  };

  const handleExcelChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (!allowedTypes.includes(file.type)) {
      setExcelError("Veuillez importer un fichier Excel (.xlsx ou .xls).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        setExcelRows(json);
        setExcelError("");
        setExcelResult(null);
      } catch (err) {
        console.error("Erreur lors de la lecture du fichier Excel:", err);
        setExcelError("Impossible de lire le fichier Excel.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExcelImport = async () => {
    if (!excelRows.length) return;
    setExcelLoading(true);
    setExcelError("");
    setExcelResult(null);
    try {
       // LOG dans la console du navigateur
    console.log('Lignes Excel envoyées:', excelRows);
    console.log('Première ligne:', excelRows[0]);
    console.log('Clés disponibles:', Object.keys(excelRows[0] || {}));
    console.log('Premier élément:', excelRows[0] ? JSON.stringify(excelRows[0]) : 'Aucune ligne');
      const result = await api.bulkImportSubscriptions(excelRows);
      setExcelResult(result);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Erreur lors de l'import Excel";
      setExcelError(message);
    } finally {
      setExcelLoading(false);
    }
  };

  return (
    <div className="d-flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-grow-1 p-4 md:p-6 space-y-4">
        <h2 className="text-2xl font-semibold mb-2">Import des données</h2>

        <div className="grid lg:grid-cols-2 gap-4">
          <section className="bg-white rounded-xl shadow-sm p-4 md:p-5 space-y-3">
            <h3 className="text-lg font-medium">Import depuis un PDF</h3>
            <p className="text-sm text-gray-600">
              Téléchargez un rapport PDF structuré pour pré-remplir les
              informations d’un client et de son abonnement.
            </p>
            <input
              type="file"
              accept="application/pdf"
              onChange={handlePdfChange}
              className="form-control mb-2"
            />
            {pdfError && <div className="alert alert-danger">{pdfError}</div>}
            <div className="border rounded-lg p-3 max-h-80 overflow-auto text-sm">
              <h5 className="fw-semibold mb-2">Données extraites</h5>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  Report Date: {extractedData.report_date}
                </li>
                <li className="list-group-item">
                  Commercial Login: {extractedData.commercial_login}
                </li>
                <li className="list-group-item">
                  Full Name: {extractedData.full_name}
                </li>
                <li className="list-group-item">
                  Line Number: {extractedData.line_number}
                </li>
                <li className="list-group-item">
                  Phone: {extractedData.phone}
                </li>
                <li className="list-group-item">
                  Email: {extractedData.email}
                </li>
                <li className="list-group-item">
                  Location: {extractedData.location}
                </li>
                <li className="list-group-item">
                  Offer: {extractedData.offer}
                </li>
                <li className="list-group-item">
                  Payer Number: {extractedData.payer_number}
                </li>
                <li className="list-group-item">
                  Subscription Date: {extractedData.subscription_date}
                </li>
                <li className="list-group-item">
                  Installation Date: {extractedData.installation_date}
                </li>
                <li className="list-group-item">
                  Payment Reference: {extractedData.payment_reference}
                </li>
                <li className="list-group-item">
                  Notes: {extractedData.notes}
                </li>
                <li className="list-group-item">
                  Client Type: {extractedData.client_type}
                </li>
              </ul>
            </div>
          </section>

          <section className="bg-white rounded-xl shadow-sm p-4 md:p-5 space-y-3">
            <h3 className="text-lg font-medium">Import depuis un Excel</h3>
            <p className="text-sm text-gray-600">
              Le fichier doit contenir au minimum les colonnes&nbsp;:
              <br />
              <span className="font-medium">
                Date, Commercial, Client, Téléphone, Email, Service, Statut,
                Numéro de ligne, Montant contrat, Notes
              </span>
              .
            </p>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelChange}
              className="form-control mb-2"
            />
            {excelError && <div className="alert alert-danger">{excelError}</div>}

            {excelRows.length > 0 && (
              <>
                <p className="text-sm text-gray-700 mb-2">
                  Aperçu des premières lignes ({excelRows.length} au total) :
                </p>
                <div className="border rounded-lg max-h-64 overflow-auto text-xs mb-2">
                  <table className="table table-sm mb-0">
                    <thead>
                      <tr>
                        {Object.keys(excelRows[0]).map((key) => (
                          <th key={key}>{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {excelRows.slice(0, 5).map((row, idx) => (
                        <tr key={idx}>
                          {Object.keys(excelRows[0]).map((key) => (
                            <td key={key}>{row[key]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  className="btn btn-success"
                  onClick={handleExcelImport}
                  disabled={excelLoading}
                >
                  {excelLoading
                    ? "Import en cours..."
                    : "Importer ces lignes dans le CRM"}
                </button>
              </>
            )}

            {excelResult && (
              <div className="alert alert-info mt-3 text-sm">
                <p className="mb-1">
                  <strong>Import terminé.</strong>
                </p>
                <p className="mb-0">
                  Créés : {excelResult.created} • Ignorés :{" "}
                  {excelResult.skipped} • Erreurs :{" "}
                  {excelResult.errors?.length || 0}
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}