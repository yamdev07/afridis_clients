import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "./Sidebar";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Filter,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  X,
  MoreVertical,
  CheckCircle,
  Clock,
  Zap,
  RefreshCw,
  MoreHorizontal,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../api/clientflow";
import Button from "../components/ui/Button";
import GlassCard from "../components/ui/GlassCard";
import NotificationBell from "../components/NotificationBell";
import { Users } from "lucide-react";

const emptyForm = {
  id: null,
  service_category: "telecom", // 'telecom' | 'digital'
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
  service_description: "", // pour les services digitaux
  tarif: "",               // tarif pour services digitaux
};

const deserializeClient = (row) => {
  let meta = {};
  try {
    meta = row.address ? JSON.parse(row.address) : {};
  } catch {
    meta = {};
  }

  return {
    id: row.id,
    full_name: row.full_name,
    phone: row.phone || "",
    email: row.email || "",
    line_number: row.main_line_number || meta.line_number || "",
    commercial_login: row.commercial_login || meta.commercial_login || "",
    location: meta.location || "",
    offer: row.offer || meta.offer || "",
    payer_number: meta.payer_number || "",
    subscription_date: row.subscription_date ? row.subscription_date.split('T')[0] : (meta.subscription_date || ""),
    installation_date: row.installation_date ? row.installation_date.split('T')[0] : (meta.installation_date || ""),
    payment_reference: meta.payment_reference || "",
    notes: meta.notes || "",
    client_type: meta.client_type || "B2C",
    service_category: meta.service_category || "telecom",
    service_description: meta.service_description || "",
    tarif: meta.tarif || "",
  };
};

const buildPayload = (form) => ({
  full_name: form.full_name,
  phone: form.phone,
  email: form.email,
  address: JSON.stringify({
    service_category: form.service_category || "telecom",
    line_number: form.line_number,
    commercial_login: form.commercial_login,
    location: form.location,
    offer: form.offer,
    payer_number: form.payer_number,
    subscription_date: form.subscription_date,
    installation_date: form.installation_date,
    payment_reference: form.payment_reference,
    notes: form.notes,
    client_type: form.client_type,
    service_description: form.service_description,
    tarif: form.tarif,
  }),
});

function Clients() {
  const [clients, setClients] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [services, setServices] = useState([]);

  const user = useMemo(() => JSON.parse(localStorage.getItem("user") || "null"), []);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.listClients({ page: 1, limit: 2000 });
      const data = Array.isArray(res?.data) ? res.data : [];
      const normalized = data.map(deserializeClient);
      setAllClients(normalized);
      setClients(normalized);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await api.listServices();
      setServices(res?.data || []);
    } catch (err) {
      console.error("Erreur chargement services:", err);
    }
  };

  useEffect(() => {
    load();
    fetchServices();
  }, []);

  const [searchLogin, setSearchLogin] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredClients = useMemo(() => {
    let result = allClients;
    const qName = search.toLowerCase().trim();
    if (qName) {
      result = result.filter((client) =>
        (client.line_number || "").toLowerCase().includes(qName) ||
        (client.full_name || "").toLowerCase().includes(qName)
      );
    }

    const qLogin = searchLogin.toLowerCase().trim();
    if (qLogin) {
      result = result.filter((client) =>
        (client.commercial_login || "").toLowerCase().includes(qLogin)
      );
    }

    if (statusFilter === "installed") {
      result = result.filter((client) => !!client.installation_date);
    } else if (statusFilter === "pending") {
      result = result.filter((client) => !client.installation_date);
    }

    return result;
  }, [allClients, search, searchLogin, statusFilter]);

  useEffect(() => {
    setClients(filteredClients);
  }, [filteredClients]);

  const deleteClient = async (id) => {
    if (!window.confirm("Supprimer ce client ?")) return;
    try {
      await api.deleteClient(id);
      const updated = allClients.filter((c) => c.id !== id);
      setAllClients(updated);
      if (selectedClient?.id === id) setSelectedClient(null);
    } catch (err) {
      alert(err?.response?.data?.message || "Erreur de suppression");
    }
  };

  const saveClient = async () => {
    if (!formData.full_name) {
      alert("Nom complet obligatoire");
      return;
    }
    // Pour les services télécom, le numéro de ligne est obligatoire
    if (formData.service_category !== "digital" && !formData.line_number) {
      alert("Numéro de ligne obligatoire pour les services Télécom/Internet");
      return;
    }

    try {
      const payload = buildPayload(formData);
      let saved;
      if (editing && formData.id) {
        saved = await api.updateClient(formData.id, payload);
      } else {
        saved = await api.createClient(payload);
      }
      const uiClient = deserializeClient(saved);
      const updated = editing
        ? allClients.map((c) => (c.id === uiClient.id ? uiClient : c))
        : [uiClient, ...allClients];
      setAllClients(updated);
      setShowModal(false);
      setSelectedClient(uiClient);
    } catch (err) {
      alert(err?.response?.data?.message || "Erreur d'enregistrement");
    }
  };

  const isCommercial = user?.role === "commercial";

  return (
    <div className="flex min-h-screen bg-bg-light font-inter transition-colors duration-500">
      <Sidebar />

      <main className="flex-grow p-4 lg:p-10 overflow-y-auto custom-scrollbar">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Gestion des Clients</h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">Gestion et suivi du portefeuille client.</p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <button
              onClick={() => { setEditing(false); setFormData(emptyForm); setShowModal(true); }}
              className="px-6 py-2.5 bg-primary text-white rounded-lg font-semibold text-xs uppercase tracking-widest shadow-sm hover:bg-primary-hover active:scale-95 transition-all flex items-center gap-2"
            >
              <Plus size={16} strokeWidth={3} />
              <span>Nouveau client</span>
            </button>
          </div>
        </header>

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap lg:flex-nowrap items-center gap-4 w-full lg:w-auto flex-grow">
            <div className="relative flex-grow lg:flex-grow-0 min-w-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="search"
                placeholder="Nom ou numéro de ligne..."
                className="w-full lg:w-80 pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 ring-primary/20 transition-all text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="relative flex-grow lg:flex-grow-0 min-w-0">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="search"
                placeholder="Commercial (Ex: m.dupont)"
                className="w-full lg:w-64 pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 ring-primary/20 transition-all text-sm"
                value={searchLogin}
                onChange={(e) => setSearchLogin(e.target.value)}
              />
            </div>
            <div className="relative flex-grow lg:flex-grow-0 min-w-0">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select
                className="w-full lg:w-48 pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 ring-primary/20 transition-all text-sm appearance-none cursor-pointer font-semibold text-slate-900"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="" className="bg-white">Tous les statuts</option>
                <option value="installed" className="bg-white">Installés</option>
                <option value="pending" className="bg-white">En attente</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <button onClick={load} className="flex-1 lg:flex-none px-4 py-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-radius-card border border-accent-red/20 bg-accent-red/5 mb-8">
            <p className="text-[10px] font-black text-accent-red uppercase tracking-widest flex items-center gap-3">
              <AlertCircle size={18} /> {error}
            </p>
          </div>
        )}

        {/* User Card Table */}
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-6">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-black text-text-muted-light uppercase tracking-widest">Chargement en cours...</p>
            </div>
          ) : (
            <>
        <div className="hidden lg:block overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-sm">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Identité</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ligne & Offre</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Commercial</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Statut</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.map((client) => (
                <tr
                  key={client.id}
                  className="hover:bg-slate-50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center text-primary font-bold text-xs">
                        {client.full_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{client.full_name}</p>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{client.client_type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-slate-700">{client.line_number || "---"}</p>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{client.offer || "Sans offre"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{client.commercial_login || "Inconnu"}</span>
                  </td>
                  <td className="px-6 py-4">
                    {(() => {
                      if (!client.installation_date) {
                        return (
                          <span className="inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-500">
                            En attente
                          </span>
                        );
                      }
                      return (
                        <span className="inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-600">
                          Installé
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setSelectedClient(client)} className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded transition-all">
                        <Eye size={14} />
                      </button>
                      <button onClick={() => { setEditing(true); setFormData(client); setShowModal(true); }} className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded transition-all">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => deleteClient(client.id)} className="p-2 text-slate-400 hover:text-accent-red hover:bg-slate-100 rounded transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Grid - Better usability on Small screens */}
        <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
          {clients.map((client) => (
            <div key={client.id} className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                    {client.full_name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 leading-none">{client.full_name}</h3>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1">{client.client_type} · {client.commercial_login}</p>
                  </div>
                </div>
                {client.installation_date ? (
                   <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Installé</span>
                ) : (
                   <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-slate-800 text-slate-400 border border-slate-700">Attente</span>
                )}
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-slate-900 truncate">{client.offer || "Aucune offre"}</p>
                  <p className="text-[9px] text-slate-500 font-bold tracking-widest">{client.line_number || "Fibre ND"}</p>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => setSelectedClient(client)} className="p-2 bg-slate-100 rounded text-slate-500"><Eye size={14}/></button>
                   <button onClick={() => { setEditing(true); setFormData(client); setShowModal(true); }} className="p-2 bg-primary/10 rounded text-primary"><Pencil size={14}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    )}
  </div>

  {clients.length === 0 && !loading && (
          <div className="py-24 text-center">
            <div className="flex flex-col items-center gap-6">
              <div className="w-20 h-20 bg-bg-light rounded-full flex items-center justify-center text-text-muted-light/20">
                <Users size={40} />
              </div>
              <div>
                <p className="text-[10px] font-black text-text-main-light uppercase tracking-[0.25em]">Aucun client</p>
                <p className="text-xs text-text-muted-light mt-2 font-medium">Votre base de données est vide ou aucun résultat ne correspond.</p>
              </div>
            </div>
          </div>
        )}

        {/* Selected Client Modal/Panel */}
        <AnimatePresence>
          {selectedClient && (
            <div className="fixed inset-0 z-[110] flex items-center justify-end p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedClient(null)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                className="relative w-full max-w-lg h-full bg-white rounded-radius-card shadow-2xl flex flex-col border border-border-light"
              >
                <div className="p-8 border-b border-border-light flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-8 bg-primary rounded-full shadow-lg shadow-primary/20" />
                    <h2 className="text-2xl font-black text-text-main-light tracking-tight">Fiche Client</h2>
                  </div>
                  <button onClick={() => setSelectedClient(null)} className="p-3 bg-bg-light hover:bg-primary/10 hover:text-primary rounded-radius-button transition-all">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-grow overflow-y-auto p-10 space-y-10 custom-scrollbar">
                  <div className="flex items-center gap-8">
                    <div className="h-24 w-24 rounded-[30px] bg-primary flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-primary/40 border-8 border-white">
                      {selectedClient.full_name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-text-main-light leading-none">{selectedClient.full_name}</h3>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="px-3 py-1 bg-primary/10 rounded-full text-[10px] font-black text-primary uppercase tracking-widest">{selectedClient.client_type}</span>
                        <span className="text-[10px] font-black text-text-muted-light uppercase tracking-widest">{selectedClient.commercial_login}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 bg-slate-50 p-8 rounded-2xl border border-slate-200 shadow-inner">
                    <DetailItem icon={Phone} label="Téléphone" value={selectedClient.phone} />
                    <DetailItem icon={Mail} label="Email" value={selectedClient.email} />
                    <DetailItem icon={MapPin} label="Zone" value={selectedClient.location} />
                    <DetailItem icon={FileText} label="Ligne Fixe / Tracker" value={selectedClient.line_number} />
                    <DetailItem icon={Zap} label="Offre Active" value={selectedClient.offer} />
                    <DetailItem icon={CreditCard} label="Code Payeur" value={selectedClient.payer_number} />
                    <DetailItem icon={Calendar} label="Date Souscription" value={selectedClient.subscription_date} />
                    <DetailItem icon={CheckCircle} label="Date Installation" value={selectedClient.installation_date} />
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2">Notes & Observations</h4>
                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl min-h-[120px] shadow-sm">
                      <p className="text-sm text-slate-700 leading-relaxed font-medium">
                        {selectedClient.notes || "Aucune observation enregistrée pour ce client."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-8 border-t border-border-light flex gap-4 bg-bg-light/30">
                  <Button
                    variant="primary"
                    className="flex-grow !py-5 shadow-primary/20"
                    icon={Pencil}
                    onClick={() => { setEditing(true); setFormData(selectedClient); setSelectedClient(null); setShowModal(true); }}
                  >
                    Éditer le dossier
                  </Button>
                  <button
                    onClick={() => deleteClient(selectedClient.id)}
                    className="flex items-center justify-center p-5 bg-accent-red hover:bg-accent-red/90 text-white rounded-radius-button transition-all shadow-lg shadow-accent-red/20 active:scale-95"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Form Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowModal(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                className="relative w-full max-w-3xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-border-light"
              >
                <div className="p-10 border-b border-border-light flex items-center justify-between bg-bg-light/10">
                  <div>
                    <h2 className="text-3xl font-black text-text-main-light tracking-tight">{editing ? "Mise à jour Dossier" : "Nouveau Dossier Client"}</h2>
                    <p className="text-sm text-text-muted-light mt-2 font-medium">Configurez les paramètres du client dans ClientFlow.</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="p-4 bg-bg-light hover:bg-white rounded-radius-button transition-all shadow-premium">
                    <X size={24} />
                  </button>
                </div>

                <div className="flex-grow overflow-y-auto p-10 space-y-12 custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                    {/* Section Catégorie de service */}
                    <div className="md:col-span-2 space-y-3">
                      <SectionHeader icon={Zap} title="Type de Dossier" />
                      <div className="flex gap-3">
                        {[
                          { v: "telecom", l: "📡 Télécom / Internet", desc: "Ligne fixe, fibre, offre internet" },
                          { v: "digital", l: "💻 Service Digital", desc: "Email pro, site web, application" },
                        ].map(opt => (
                          <button
                            key={opt.v}
                            type="button"
                            onClick={() => setFormData({ ...formData, service_category: opt.v })}
                            className={`flex-1 p-4 rounded-radius-card border-2 transition-all text-left ${formData.service_category === opt.v
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border-light text-text-muted-light hover:border-primary/30"
                              }`}
                          >
                            <p className="text-sm font-black">{opt.l}</p>
                            <p className="text-[10px] font-bold mt-1 opacity-70">{opt.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Section 1 */}
                    <div className="space-y-6 md:col-span-2">
                      <SectionHeader icon={User} title="Identité & Affectation" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Nom Complet" value={formData.full_name} onChange={(v) => setFormData({ ...formData, full_name: v })} placeholder="Ex: Marc DUPONT" required />
                        <Input label="Trigramme Commercial" value={formData.commercial_login} onChange={(v) => setFormData({ ...formData, commercial_login: v })} placeholder="Ex: m.dupont" />
                      </div>
                    </div>

                    {/* Section 2 - Contacts */}
                    <div className="space-y-6 md:col-span-2">
                      <SectionHeader icon={Phone} title="Contacts & Technique" />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {formData.service_category !== "digital" && (
                          <Input
                            label="Numéro de Ligne (Fixe)"
                            value={formData.line_number}
                            onChange={(v) => setFormData({ ...formData, line_number: v })}
                            placeholder="01.23.45.67.89"
                            required
                            readOnly={isCommercial && editing}
                          />
                        )}
                        <Input label="Mobile" value={formData.phone} onChange={(v) => setFormData({ ...formData, phone: v })} placeholder="+225 07..." />
                        <Input label="E-mail" value={formData.email} onChange={(v) => setFormData({ ...formData, email: v })} placeholder="client@domaine.com" type="email" />
                      </div>
                      <Input label="Zone Géographique / Ville" value={formData.location} onChange={(v) => setFormData({ ...formData, location: v })} placeholder="Ex: Abidjan, Plateau" icon={MapPin} />
                    </div>

                    {/* Section 3 - Service & Billing */}
                    <div className="space-y-6 md:col-span-2">
                      <SectionHeader icon={Zap} title="Service & Billing" />
                      {formData.service_category === "digital" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Select label="Type de Service Digital" value={formData.offer} options={[
                            { v: '', l: 'Sélectionnez...' },
                            { v: 'Email Pro', l: '📧 Création Email Professionnel' },
                            { v: 'Site Web', l: '🌐 Création Site Web' },
                            { v: 'App Mobile', l: '📱 Application Mobile' },
                            { v: 'SEO', l: '🔍 Référencement SEO' },
                            { v: 'Maintenance', l: '🔧 Maintenance / Support' },
                          ]} onChange={(v) => setFormData({ ...formData, offer: v })} />
                          <Input label="Tarif Négocié (FCFA)" type="number" value={formData.tarif} onChange={(v) => setFormData({ ...formData, tarif: v })} placeholder="Ex: 150000" />
                          <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-text-muted-light uppercase tracking-widest ml-1">Description du Service</label>
                            <textarea
                              className="w-full px-6 py-4 bg-bg-light/30 border border-border-light rounded-radius-card outline-none focus:ring-4 ring-primary/10 focus:bg-white transition-all text-sm font-bold text-text-main-light h-24 resize-none placeholder:text-text-muted-light shadow-premium"
                              placeholder="Décrivez le service commandé, les spécifications, les livrables..."
                              value={formData.service_description}
                              onChange={(e) => setFormData({ ...formData, service_description: e.target.value })}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <Select label="Segmentation" value={formData.client_type} options={[{ v: 'B2C', l: 'B2C - Particulier' }, { v: 'B2B', l: 'B2B - Pro' }]} onChange={(v) => setFormData({ ...formData, client_type: v })} />
                          <Select
                            label="Offre Souscrite"
                            value={formData.offer}
                            options={[
                              { v: '', l: 'Sélectionnez...' },
                              ...services.map(s => ({ v: s.code, l: s.label }))
                            ]}
                            onChange={(v) => setFormData({ ...formData, offer: v })}
                          />
                        </div>
                      )}
                    </div>

                    {/* Section 4 */}
                    <div className="space-y-6 md:col-span-2">
                      <SectionHeader icon={Calendar} title="Chronologie" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Inscription" type="date" value={formData.subscription_date} onChange={(v) => setFormData({ ...formData, subscription_date: v })} />
                        <Input label="Installation" type="date" value={formData.installation_date} onChange={(v) => setFormData({ ...formData, installation_date: v })} />
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-4">
                      <SectionHeader icon={FileText} title="Observations" />
                      <textarea
                        className="w-full px-6 py-4 bg-bg-light/30 border border-border-light rounded-radius-card outline-none focus:ring-4 ring-primary/10 focus:bg-white transition-all text-sm font-bold text-text-main-light h-32 resize-none placeholder:text-text-muted-light shadow-premium"
                        placeholder="Rédigez les détails spécifiques ici..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-10 border-t border-border-light bg-bg-light/30 flex flex-col sm:flex-row justify-end gap-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-10 py-5 text-[10px] font-black text-text-muted-light uppercase tracking-[0.2em] hover:text-primary transition-colors"
                  >
                    Abandonner
                  </button>
                  <Button variant="primary" onClick={saveClient} className="!px-16 !py-5 shadow-primary/30">
                    {editing ? "Mettre à jour" : "Sauvegarder"}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main >
    </div >
  );
}

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-3 border-b border-border-light pb-3">
      <Icon className="text-primary" size={20} strokeWidth={3} />
      <h3 className="text-[10px] font-black text-text-main-light uppercase tracking-[0.25em]">{title}</h3>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-text-muted-light mb-1">
        <Icon size={14} />
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-sm font-black text-text-main-light truncate">{value || "---"}</p>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text", required = false, readOnly = false }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-text-muted-light uppercase tracking-widest ml-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        className={`w-full px-6 py-4 bg-bg-light/30 border border-border-light rounded-radius-button outline-none focus:ring-4 ring-primary/10 focus:bg-white transition-all text-sm font-bold text-text-main-light placeholder:text-text-muted-light shadow-premium ${readOnly ? "opacity-60 cursor-not-allowed select-none" : ""}`}
        placeholder={placeholder}
        value={value || ""}
        onChange={(e) => !readOnly && onChange(e.target.value)}
        readOnly={readOnly}
      />
    </div>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-text-muted-light uppercase tracking-widest ml-1">{label}</label>
      <div className="relative">
        <select
          className="w-full px-6 py-4 bg-bg-light/30 border border-border-light rounded-radius-button outline-none focus:ring-4 ring-primary/10 focus:bg-white transition-all text-sm font-bold text-text-main-light appearance-none cursor-pointer shadow-premium"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map(opt => (
            <option key={opt.v} value={opt.v} className="bg-white">{opt.l}</option>
          ))}
        </select>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted-light">
          <MoreVertical size={16} />
        </div>
      </div>
    </div>
  );
}

export default Clients;
