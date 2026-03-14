import React, { useMemo, useState } from "react";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import Sidebar from "./Sidebar";
import {
  FileDown,
  Filter,
  Calendar,
  User,
  FileText,
  Download,
  ArrowUpDown,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../api/clientflow";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import NotificationBell from "../components/NotificationBell";

export default function Export() {
  const [filters, setFilters] = useState({
    range: "mois",
    from_date: "",
    to_date: "",
    agent_login: "",
    status_code: "",
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
        return copy.sort((a, b) => new Date(a.subscription_date || a.created_at) - new Date(b.subscription_date || b.created_at));
      case "amount_desc":
        return copy.sort((a, b) => (b.contract_cost || 0) - (a.contract_cost || 0));
      case "amount_asc":
        return copy.sort((a, b) => (a.contract_cost || 0) - (b.contract_cost || 0));
      case "subscription_date_desc":
      default:
        return copy.sort((a, b) => new Date(b.subscription_date || b.created_at) - new Date(a.subscription_date || a.created_at));
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
        status_code: filters.status_code || undefined,
      };
      const data = await api.listSubscriptions(params);
      setRows(data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!sortedRows.length) return;
    const doc = new jsPDF();
    let y = 10;
    doc.setFontSize(18);
    doc.text(`Rapport des Ventes ClientFlow`, 10, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`Généré le: ${new Date().toLocaleString()}`, 10, y);
    y += 15;

    doc.setFontSize(12);
    doc.text(`Total: ${sortedRows.length} transactions`, 10, y);
    y += 10;

    sortedRows.forEach((row, i) => {
      if (y > 280) { doc.addPage(); y = 10; }
      const line = `${row.subscription_date || row.created_at.split('T')[0]} | ${row.agent_login || "—"} | ${row.client_name} | ${row.service_label} | ${row.contract_cost ?? 0} F`;
      doc.text(line, 10, y);
      y += 6;
    });
    doc.save(`export_ventes_${new Date().getTime()}.pdf`);
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
    XLSX.writeFile(workbook, "ventes_clientflow.xlsx");
  };

  return (
    <div className="flex min-h-screen bg-bg-light font-inter transition-colors duration-500">
      <Sidebar />
      <main className="flex-grow p-4 lg:p-10 overflow-y-auto custom-scrollbar">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-text-main-light tracking-tight">Export & Intelligence</h1>
            <p className="text-text-muted-light font-medium">Extractions stratégiques et rapports financiers structurés.</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <NotificationBell />
            <div className="flex gap-3 flex-grow md:flex-grow-0">
              <Button variant="secondary" onClick={handleExportPDF} disabled={!sortedRows.length} icon={FileText} className="!bg-white border-border-light !text-text-muted-light shadow-premium flex-grow md:flex-grow-0">PDF</Button>
              <Button variant="primary" onClick={handleExportExcel} disabled={!sortedRows.length} icon={Download} className="shadow-primary/30 flex-grow md:flex-grow-0">EXCEL</Button>
            </div>
          </div>
        </header>

        <section className="space-y-10">
          {/* Filters Card */}
          <GlassCard className="p-10 border-border-light rounded-radius-card shadow-premium" hover={true}>
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-radius-card flex items-center justify-center border border-primary/20">
                <Filter size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-text-main-light tracking-tight leading-none mb-1">Ciblage des Données</h3>
                <p className="text-[10px] font-black text-text-muted-light uppercase tracking-widest">Ajustez les paramètres de sélection</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 items-end">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted-light ml-1">Sourcing Agent</label>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted-light transition-colors group-focus-within:text-primary" size={18} strokeWidth={2.5} />
                  <input
                    type="text"
                    name="agent_login"
                    placeholder="Login commercial..."
                    className="w-full pl-14 pr-5 py-4 bg-bg-light/50 border border-border-light rounded-radius-button outline-none focus:ring-8 ring-primary/5 focus:bg-white transition-all text-xs font-black text-text-main-light placeholder:text-text-muted-light"
                    value={filters.agent_login}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted-light ml-1">Statut Installation</label>
                <div className="relative group">
                  <CheckCircle2 className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted-light transition-colors group-focus-within:text-primary" size={18} strokeWidth={2.5} />
                  <select
                    name="status_code"
                    value={filters.status_code}
                    onChange={handleChange}
                    className="w-full pl-14 pr-5 py-4 bg-bg-light/50 border border-border-light rounded-radius-button outline-none focus:ring-8 ring-primary/5 focus:bg-white transition-all text-xs font-black text-slate-900 appearance-none shadow-premium cursor-pointer"
                  >
                    <option value="" className="bg-white">TOUS LES STATUTS</option>
                    <option value="installed" className="bg-white">INSTALLÉS</option>
                    <option value="pending" className="bg-white">EN ATTENTE</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted-light ml-1">Début Période</label>
                <div className="relative group">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted-light transition-colors group-focus-within:text-primary" size={18} strokeWidth={2.5} />
                  <input
                    type="date"
                    name="from_date"
                    className="w-full pl-14 pr-5 py-4 bg-bg-light/50 border border-border-light rounded-radius-button outline-none focus:ring-8 ring-primary/5 focus:bg-white transition-all text-xs font-black text-text-main-light appearance-none shadow-premium placeholder:text-text-muted-light"
                    value={filters.from_date}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted-light ml-1">Fin Période</label>
                <div className="relative group">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted-light transition-colors group-focus-within:text-primary" size={18} strokeWidth={2.5} />
                  <input
                    type="date"
                    name="to_date"
                    className="w-full pl-14 pr-5 py-4 bg-bg-light/50 dark:bg-white/5 border border-border-light dark:border-white/10 rounded-radius-button outline-none focus:ring-8 ring-primary/5 focus:bg-white dark:focus:bg-white/10 transition-all text-xs font-black text-text-main-light dark:text-text-main-dark appearance-none shadow-premium placeholder:text-text-muted-light"
                    value={filters.to_date}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <Button onClick={handleFetch} loading={loading} className="!py-4.5 !rounded-radius-button shadow-premium" icon={Search}>
                Synchroniser
              </Button>
            </div>

            <div className="mt-10 pt-8 border-t border-border-light flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 group">
                  <ArrowUpDown size={16} className="text-text-muted-light group-hover:text-primary transition-colors" />
                  <select
                    className="bg-transparent text-[11px] font-black text-slate-900 outline-none cursor-pointer uppercase tracking-widest"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="subscription_date_desc" className="bg-white text-slate-900">CHRONOLOGIE DESC</option>
                    <option value="subscription_date_asc" className="bg-white text-slate-900">CHRONOLOGIE ASC</option>
                    <option value="amount_desc" className="bg-white text-slate-900">VOLUME AFFAIRE MAX</option>
                    <option value="amount_asc" className="bg-white text-slate-900">VOLUME AFFAIRE MIN</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-text-muted-light uppercase tracking-widest">Enregistrements :</span>
                <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[11px] font-black border border-primary/20 shadow-premium">{sortedRows.length}</span>
              </div>
            </div>
          </GlassCard>

          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6 bg-accent-red/10 text-accent-red rounded-radius-button flex items-center gap-4 font-black text-xs uppercase tracking-widest border border-accent-red/20 shadow-premium">
              <AlertCircle size={24} strokeWidth={3} /> {error}
            </motion.div>
          )}

          {/* Preview Table */}
          <div className="bg-bg-light/50 rounded-radius-card border border-border-light shadow-premium overflow-hidden transition-all duration-500">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-bg-light border-b border-border-light">
                    <th className="px-10 py-6 text-[10px] font-black text-text-muted-light uppercase tracking-[0.2em]">Signal & Date</th>
                    <th className="px-10 py-6 text-[10px] font-black text-text-muted-light uppercase tracking-[0.2em]">Client / Agent</th>
                    <th className="px-10 py-6 text-[10px] font-black text-text-muted-light uppercase tracking-[0.2em]">Service Flux</th>
                    <th className="px-10 py-6 text-[10px] font-black text-text-muted-light uppercase tracking-[0.2em]">Volume Financier</th>
                    <th className="px-10 py-6 text-[10px] font-black text-text-muted-light uppercase tracking-[0.2em] text-right">Etat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light font-bold">
                  {sortedRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-40 text-center">
                        <div className="relative inline-block mb-8">
                          <Search size={80} className="text-text-muted-light/20" strokeWidth={1} />
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute -top-2 -right-2 text-primary/20">
                            <Sparkles size={32} />
                          </motion.div>
                        </div>
                        <p className="font-black text-text-muted-light uppercase tracking-[0.3em] text-[10px]">Aucune donnée capturée dans ce filtre.</p>
                      </td>
                    </tr>
                  ) : (
                    sortedRows.map((row) => (
                      <tr key={row.id} className="hover:bg-primary/[0.02] transition-colors group">
                        <td className="px-10 py-6 border-none">
                          <div className="flex items-center gap-4 text-text-muted-light text-xs font-black uppercase tracking-widest whitespace-nowrap">
                            <Clock size={16} className="text-primary opacity-50" strokeWidth={3} />
                            {row.subscription_date || row.created_at.split('T')[0]}
                          </div>
                        </td>
                        <td className="px-10 py-6 border-none">
                          <div className="space-y-1">
                            <p className="font-black text-text-main-light tracking-tight text-lg leading-none">{row.client_name}</p>
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                              <p className="text-[10px] text-text-muted-light font-black uppercase tracking-widest">{row.agent_login || 'Commercial non identifié'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6 border-none">
                          <span className="inline-flex px-4 py-2 bg-bg-light text-text-main-light rounded-radius-button text-[10px] font-black uppercase tracking-widest border border-border-light shadow-premium">
                            {row.service_label}
                          </span>
                        </td>
                        <td className="px-10 py-6 border-none">
                          <div className="flex items-center gap-3">
                            <p className="text-lg font-black text-text-main-light tracking-tighter">{(row.contract_cost || 0).toLocaleString()} <span className="text-[10px] text-text-muted-light tracking-normal ml-0.5">XOF</span></p>
                            {(row.contract_cost || 0) > 100000 ? <TrendingUp size={16} className="text-accent-green" /> : <TrendingDown size={16} className="text-text-muted-light opacity-50" />}
                          </div>
                        </td>
                        <td className="px-10 py-6 text-right border-none">
                          <StatusBadge status={row.status_label} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function StatusBadge({ status }) {
  const isOk = status?.toLowerCase().includes('instal') || status?.toLowerCase().includes('valid') || status?.toLowerCase().includes('terminé') || status?.toLowerCase().includes('actif');
  return (
    <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-radius-button text-[9px] font-black uppercase tracking-[0.2em] border shadow-premium ${isOk ? 'bg-accent-green/10 text-accent-green border-accent-green/20' : 'bg-accent-orange/10 text-accent-orange border-accent-orange/20'
      }`}>
      {isOk ? <CheckCircle2 size={14} strokeWidth={3} /> : <Clock size={14} strokeWidth={3} />}
      {status}
    </div>
  );
}