import React, { useState } from "react";
import pdfToText from "react-pdftotext";
import * as XLSX from "xlsx";
import Sidebar from "./Sidebar";
import {
  FileUp,
  FileSearch,
  Database,
  CheckCircle,
  XCircle,
  Info,
  ArrowRight,
  Table as TableIcon,
  FileText,
  UploadCloud,
  Loader2,
  Trash2,
  AlertCircle,
  Sparkles,
  Zap,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../api/clientflow";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import NotificationBell from "../components/NotificationBell";

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
  const [pdfLoading, setPdfLoading] = useState(false);

  const [excelRows, setExcelRows] = useState([]);
  const [excelError, setExcelError] = useState("");
  const [excelResult, setExcelResult] = useState(null);
  const [excelLoading, setExcelLoading] = useState(false);
  const [excelReading, setExcelReading] = useState(false);

  const handlePdfChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfLoading(true);
      setPdfError("");
      pdfToText(file)
        .then((text) => {
          const data = {
            report_date: text.match(/report_date:\s*([^\n]+)/i)?.[1]?.trim() || "",
            commercial_login: text.match(/commercial_login:\s*([^\n]+)/i)?.[1]?.trim() || "",
            full_name: text.match(/full_name:\s*([^\n]+)/i)?.[1]?.trim() || "",
            line_number: text.match(/line_number:\s*([^\n]+)/i)?.[1]?.trim() || "",
            phone: text.match(/phone:\s*([^\n]+)/i)?.[1]?.trim() || "",
            email: text.match(/email:\s*([^\n]+)/i)?.[1]?.trim() || "",
            location: text.match(/location:\s*([^\n]+)/i)?.[1]?.trim() || "",
            offer: text.match(/offer:\s*([^\n]+)/i)?.[1]?.trim() || "",
            payer_number: text.match(/payer_number:\s*([^\n]+)/i)?.[1]?.trim() || "",
            subscription_date: text.match(/subscription_date:\s*([^\n]+)/i)?.[1]?.trim() || "",
            installation_date: text.match(/installation_date:\s*([^\n]+)/i)?.[1]?.trim() || "",
            payment_reference: text.match(/payment_reference:\s*([^\n]+)/i)?.[1]?.trim() || "",
            notes: text.match(/notes:\s*([^\n]+)/i)?.[1]?.trim() || "",
            client_type: text.match(/client_type:\s*([^\n]+)/i)?.[1]?.trim() || "B2C",
          };
          setExtractedData(data);
        })
        .catch((err) => {
          setPdfError("Impossible d'extraire les données du PDF.");
        })
        .finally(() => setPdfLoading(false));
    } else {
      setPdfError("Format invalide. PDF requis.");
    }
  };

  const handleExcelChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setExcelReading(true);
    setExcelError("");
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        setExcelRows(json);
      } catch (err) {
        setExcelError("Fichier Excel corrompu ou illisible.");
      } finally {
        setExcelReading(false);
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
      const result = await api.bulkImportSubscriptions(excelRows);
      setExcelResult(result);
    } catch (err) {
      setExcelError(err?.response?.data?.message || err.message || "Erreur d'import");
    } finally {
      setExcelLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-bg-light font-inter transition-colors duration-500">
      <Sidebar />
      <main className="flex-grow p-4 lg:p-10 overflow-y-auto custom-scrollbar">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-text-main-light tracking-tight">Acquisition de Données</h1>
            <p className="text-text-muted-light font-medium">Automatisez vos flux d'entrée via analyse PDF et intégration massive.</p>
          </div>
          <NotificationBell />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* PDF Extraction Section */}
          <section className="space-y-8">
            <GlassCard className="p-10 border-border-light rounded-radius-card flex flex-col gap-10 shadow-premium" hover={true}>
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-accent-red/10 text-accent-red rounded-radius-card flex items-center justify-center border border-accent-red/20">
                  <FileText size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-text-main-light tracking-tight leading-none mb-1">Analyseur PDF</h3>
                  <p className="text-[10px] font-black text-text-muted-light uppercase tracking-widest">Technologie OCR Prioritaire</p>
                </div>
              </div>

              <div className="relative group overflow-hidden rounded-[24px]">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border-2 border-dashed border-border-light group-hover:border-primary group-hover:bg-primary/[0.02] rounded-[24px] p-12 flex flex-col items-center justify-center gap-6 transition-all duration-500 relative bg-bg-light/30">
                  <div className="p-5 bg-white shadow-premium rounded-[18px] text-text-muted-light group-hover:text-primary transition-all duration-500 group-hover:scale-110">
                    {pdfLoading ? <RefreshCw className="animate-spin" size={32} strokeWidth={2.5} /> : <UploadCloud size={32} strokeWidth={2.5} />}
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-xs font-black text-text-main-light uppercase tracking-widest group-hover:text-primary transition-colors">Déposer le rapport d'intervention</p>
                    <p className="text-[9px] font-black text-text-muted-light uppercase tracking-widest">Signature Digitale • PDF • Max 10MB</p>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {pdfError && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-5 bg-accent-red/10 border border-accent-red/20 rounded-radius-button flex items-center gap-4 text-accent-red text-[10px] font-black uppercase tracking-widest">
                    <AlertCircle size={20} strokeWidth={3} /> {pdfError}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-4 pt-10 border-t border-border-light space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted-light">Flux d'extraction temps réel</h4>
                  {pdfLoading && <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary animate-ping" />
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">Décodage...</span>
                  </div>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
                  {Object.entries(extractedData).slice(0, 8).map(([key, val]) => (
                    <div key={key} className="flex flex-col gap-2 group/item">
                      <span className="text-[9px] font-black text-text-muted-light uppercase tracking-widest leading-none group-hover/item:text-primary transition-colors">{key.replace('_', ' ')}</span>
                      <div className="px-4 py-3 bg-bg-light/50 rounded-[12px] border border-transparent group-hover/item:border-primary/20 transition-all font-bold text-xs text-text-main-light truncate shadow-premium">
                        {val || <span className="opacity-20">—</span>}
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="primary" className="w-full !py-5 !rounded-radius-button !bg-bg-card-dark !text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-premium" icon={Zap}>
                  Injecter dans le système
                </Button>
              </div>
            </GlassCard>
          </section>

          {/* Excel Bulk Import Section */}
          <section className="space-y-8">
            <GlassCard className="p-10 border-border-light dark:border-white/5 rounded-radius-card flex flex-col gap-10 shadow-premium" hover={true}>
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-accent-green/10 text-accent-green rounded-radius-card flex items-center justify-center border border-accent-green/20">
                  <TableIcon size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-text-main-light tracking-tight leading-none mb-1">Import de Masse</h3>
                  <p className="text-[10px] font-black text-text-muted-light uppercase tracking-widest">Base de Données Excel / CSV</p>
                </div>
              </div>

              <div className="relative group overflow-hidden rounded-[24px]">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleExcelChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border-2 border-dashed border-border-light group-hover:border-accent-green group-hover:bg-accent-green/[0.02] rounded-[24px] p-12 flex flex-col items-center justify-center gap-6 transition-all duration-500 relative bg-bg-light/30">
                  <div className="p-5 bg-white shadow-premium rounded-[18px] text-text-muted-light group-hover:text-accent-green transition-all duration-500 group-hover:scale-110">
                    {excelReading ? <RefreshCw className="animate-spin" size={32} strokeWidth={2.5} /> : <FileUp size={32} strokeWidth={2.5} />}
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-xs font-black text-text-main-light uppercase tracking-widest group-hover:text-accent-green transition-colors">Transférer votre fichier Excel</p>
                    <p className="text-[9px] font-black text-text-muted-light uppercase tracking-widest">Protocoles .xlsx • .xls • .csv</p>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {excelError && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-5 bg-accent-red/10 border border-accent-red/20 rounded-radius-button flex items-center gap-4 text-accent-red text-[10px] font-black uppercase tracking-widest">
                    <AlertCircle size={20} strokeWidth={3} /> {excelError}
                  </motion.div>
                )}

                {excelRows.length > 0 && !excelResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-accent-green rounded-full shadow-lg shadow-accent-green/30" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted-light">{excelRows.length} Signatures Capturées</h4>
                      </div>
                      <button onClick={() => setExcelRows([])} className="p-2.5 text-accent-red hover:text-white hover:bg-accent-red rounded-radius-button transition-all shadow-premium active:scale-95">
                        <Trash2 size={20} strokeWidth={2.5} />
                      </button>
                    </div>

                    <div className="bg-bg-light/50 border border-border-light rounded-radius-card overflow-hidden shadow-premium">
                      <table className="w-full text-left">
                        <thead className="bg-bg-light border-b border-border-light">
                          <tr>
                            {Object.keys(excelRows[0]).slice(0, 3).map(k => <th key={k} className="px-6 py-4 text-[9px] font-black text-text-muted-light uppercase tracking-widest">{k}</th>)}
                            <th className="px-6 py-4">&nbsp;</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light font-bold">
                          {excelRows.slice(0, 4).map((r, i) => (
                            <tr key={i} className="group/row hover:bg-accent-green/[0.02]">
                              {Object.values(r).slice(0, 3).map((v, j) => <td key={j} className="px-6 py-4 text-[11px] text-text-main-light truncate max-w-[120px]">{v}</td>)}
                              <td className="px-6 py-4 text-right opacity-0 group-hover/row:opacity-100 transition-opacity">
                                <Info size={14} className="text-text-muted-light inline-block" />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {excelRows.length > 4 && <div className="p-3 text-center text-[9px] font-black text-text-muted-light uppercase tracking-widest border-t border-border-light bg-bg-light/30">+{excelRows.length - 4} autres lignes</div>}
                    </div>

                    <Button
                      variant="primary"
                      className="w-full !py-6 !rounded-radius-button !bg-accent-green hover:!bg-emerald-600 shadow-xl shadow-accent-green/20 font-black uppercase tracking-[0.3em] text-[11px]"
                      onClick={handleExcelImport}
                      loading={excelLoading}
                      icon={CheckCircle}
                    >
                      Synchroniser la base
                    </Button>
                  </motion.div>
                )}

                {excelResult && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-8 bg-primary/5 border border-primary/20 rounded-[32px] text-center space-y-4 shadow-premium">
                    <div className="w-16 h-16 bg-accent-green/10 text-accent-green rounded-radius-card flex items-center justify-center mx-auto mb-2 shadow-lg shadow-accent-green/20">
                      <CheckCircle size={32} strokeWidth={3} />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-text-main-light tracking-tight">Transmission Terminée</h4>
                      <p className="text-sm text-text-muted-light font-black uppercase tracking-widest mt-1">
                        {excelResult.created} nouveaux flux injectés • {excelResult.skipped} redondances ignorées.
                      </p>
                    </div>
                    <Button variant="secondary" onClick={() => { setExcelResult(null); setExcelRows([]); }} className="!py-4 !px-10 !rounded-radius-button !bg-white !text-text-muted-light text-[10px] font-black uppercase tracking-widest shadow-premium border border-border-light">Ouvrir un nouveau lot</Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          </section>

        </div>
      </main>
    </div>
  );
}