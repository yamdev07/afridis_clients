import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "./Sidebar";
import {
  Plus,
  Search,
  Settings,
  Users,
  Package,
  CheckCircle,
  XCircle,
  Info,
  TrendingUp,
  CreditCard,
  ChevronRight,
  ArrowLeft,
  Filter,
  RefreshCcw,
  Zap,
  Globe,
  Database,
  X,
  RefreshCw,
  MoreHorizontal,
  Box,
  LayoutGrid,
  Trash2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../api/clientflow";
import Button from "../components/ui/Button";
import GlassCard from "../components/ui/GlassCard";
import NotificationBell from "../components/NotificationBell";

function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [serviceClients, setServiceClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientsError, setClientsError] = useState("");
  const [showAddClientForm, setShowAddClientForm] = useState(false);
  const [addingClient, setAddingClient] = useState(false);
  const [statuses, setStatuses] = useState([]);

  // Nouveaux états pour le formulaire d'ajout client
  const [newClientFullname, setNewClientFullname] = useState("");
  const [newLineNumber, setNewLineNumber] = useState("");
  const [newClientCost, setNewClientCost] = useState("");

  // Modal création de service
  const [showNewServiceModal, setShowNewServiceModal] = useState(false);
  const [serviceForm, setServiceForm] = useState({ code: "", label: "", description: "", monthly_price: "", is_active: true });
  const [savingService, setSavingService] = useState(false);
  const [serviceError, setServiceError] = useState("");

  const user = useMemo(() => JSON.parse(localStorage.getItem("user") || "null"), []);
  const canModifyCatalog = user?.role === 'admin' || user?.role === 'super_admin';

  const fetchServices = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.listServices();
      setServices(data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatuses = async () => {
    try {
      const data = await api.listStatuses();
      setStatuses(data || []);
    } catch (err) {
      console.error("Erreur statuts:", err);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchStatuses();
  }, []);

  const handleShowClients = async (service) => {
    setSelectedService(service);
    setClientsLoading(true);
    setClientsError("");
    setShowAddClientForm(false);
    try {
      const data = await api.getServiceClients(service.id);
      setServiceClients(data?.data || []);
    } catch (err) {
      setClientsError(err?.response?.data?.message || "Impossible de charger les abonnés");
      setServiceClients([]);
    } finally {
      setClientsLoading(false);
    }
  };

  const handleDeleteService = async (id, label) => {
    if (!window.confirm(`Supprimer définitivement le service "${label}" ?`)) return;
    try {
      await api.deleteService(id);
      setServices(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert(err?.response?.data?.message || "Erreur lors de la suppression du service");
    }
  };

  const handleAddClientToService = async (e) => {
    e.preventDefault();
    if (!newClientFullname || !newLineNumber) {
      setClientsError("Nom complet et Numéro de ligne requis");
      return;
    }

    setAddingClient(true);
    setClientsError("");

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const pendingStatus = statuses.find(s => s.code === 'pending');

      if (!pendingStatus) {
        throw new Error("Statut 'pending' introuvable.");
      }

      const clientPayload = {
        full_name: newClientFullname,
        address: JSON.stringify({
          line_number: newLineNumber,
          commercial_login: user.name || "",
          subscription_date: new Date().toISOString().split('T')[0]
        }),
        // On pourrait aussi ajouter les champs 'fixed' dans la table clients si besoin
      };

      const newClientRes = await api.createClient(clientPayload);
      const clientId = newClientRes.id;

      // Créer l'abonnement
      const subPayload = {
        client_id: clientId,
        service_id: selectedService.id,
        status_id: pendingStatus.id,
        agent_id: user.agent_id || null,
        line_number: newLineNumber,
        subscription_date: new Date().toISOString().split('T')[0],
        contract_cost: newClientCost ? parseFloat(newClientCost) : selectedService.monthly_price,
        notes: `Souscription via page Services pour ${selectedService.label}`
      };

      await api.createSubscription(subPayload);

      // On rafraîchit la liste
      const data = await api.getServiceClients(selectedService.id);
      setServiceClients(data?.data || []);

      setNewClientFullname("");
      setNewLineNumber("");
      setNewClientCost("");
      setShowAddClientForm(false);

    } catch (err) {
      setClientsError(err?.response?.data?.message || err.message || "Erreur lors de l'ajout du client");
    } finally {
      setAddingClient(false);
    }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    setSavingService(true);
    setServiceError("");
    try {
      const payload = {
        code: serviceForm.code.trim().toUpperCase().replace(/\s+/g, '_'),
        label: serviceForm.label.trim(),
        description: serviceForm.description.trim() || null,
        monthly_price: serviceForm.monthly_price ? parseFloat(serviceForm.monthly_price) : 0,
        is_active: serviceForm.is_active,
      };

      await api.createService(payload);

      // Rafraîchir la liste
      await fetchServices();
      setServiceForm({ code: "", label: "", description: "", monthly_price: "", is_active: true });
      setShowNewServiceModal(false);
    } catch (err) {
      setServiceError(err?.response?.data?.message || err.message || 'Erreur lors de la création du service');
    } finally {
      setSavingService(false);
    }
  };

  const filteredServices = useMemo(
    () =>
      services.filter((service) =>
        (service.label || "").toLowerCase().includes(search.toLowerCase())
      ),
    [services, search]
  );

  const totalRevenue = useMemo(
    () =>
      filteredServices.reduce(
        (sum, s) => sum + (Number(s.monthly_price || 0)),
        0
      ),
    [filteredServices]
  );

  return (
    <div className="flex min-h-screen bg-bg-light font-inter transition-colors duration-500">
      <Sidebar />

      <main className="flex-grow p-4 lg:p-10 overflow-y-auto custom-scrollbar">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">Services & Offres</h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">Gestion du catalogue et monitoring des souscriptions.</p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="flex gap-3">
              <button onClick={fetchServices} className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-primary transition-all shadow-sm active:scale-95">
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              </button>
              <button
                onClick={() => setShowNewServiceModal(true)}
                className="px-6 py-2.5 bg-primary text-white rounded-lg font-semibold text-xs uppercase tracking-widest shadow-sm hover:bg-primary-hover active:scale-95 transition-all flex items-center gap-2"
              >
                <Plus size={16} strokeWidth={3} />
                <span>Nouveau Service</span>
              </button>
            </div>
          </div>
        </header>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GlassCard className="p-6 flex items-center gap-4" hover={true}>
            <div className="h-12 w-12 bg-primary/5 text-primary rounded-lg border border-primary/10 flex items-center justify-center">
              <Package size={22} strokeWidth={2} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Catalog Size</p>
              <h3 className="text-xl font-bold text-slate-900 leading-none">{filteredServices.length}</h3>
            </div>
          </GlassCard>

          <GlassCard className="p-6 flex items-center gap-4" hover={true}>
            <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-500/10 flex items-center justify-center">
              <TrendingUp size={22} strokeWidth={2} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Valeur Catalogue</p>
              <h3 className="text-xl font-bold text-slate-900 leading-none">{totalRevenue.toLocaleString("fr-FR")} F</h3>
            </div>
          </GlassCard>

          <GlassCard className="p-6 flex items-center gap-4" hover={true}>
            <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-lg border border-amber-500/10 flex items-center justify-center">
              <Users size={22} strokeWidth={2} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Services Actifs</p>
              <h3 className="text-xl font-bold text-slate-900 leading-none">{filteredServices.filter(s => s.is_active).length}</h3>
            </div>
          </GlassCard>
        </div>

        {/* Search & Layout Control */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-10">
          <div className="relative flex-grow w-full md:w-auto">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted-light" size={20} />
            <input
              type="text"
              placeholder="Chercher une offre par label..."
              className="w-full pl-14 pr-4 py-4 bg-white border border-border-light rounded-radius-button outline-none focus:ring-4 ring-primary/10 focus:border-primary transition-all shadow-premium font-bold text-text-main-light placeholder:text-text-muted-light"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex bg-white border border-border-light shadow-premium">
            <button className="p-3 bg-primary text-white rounded-[12px] shadow-lg shadow-primary/20"><LayoutGrid size={20} /></button>
            <button className="p-3 text-text-muted-light hover:text-primary transition-colors"><MoreHorizontal size={20} /></button>
          </div>
        </div>

        {error && (
          <div className="p-5 rounded-radius-card border border-accent-red/20 bg-accent-red/5 mb-10">
            <p className="text-[10px] font-black text-accent-red uppercase tracking-widest flex items-center gap-3">
              <AlertCircle size={18} /> {error}
            </p>
          </div>
        )}

        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-6">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-black text-text-muted-light uppercase tracking-widest">Synchronisation catalogue...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service) => (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={service.id}
                className="h-full"
              >
                <GlassCard className="p-0 border-slate-200 bg-white group h-full flex flex-col" hover={true}>
                  <div className="p-6 flex-grow">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`p-3 rounded-lg border ${service.is_active ? 'bg-primary/5 text-primary border-primary/10' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                        <Zap size={22} strokeWidth={2} />
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors leading-tight mb-2">
                      {service.label}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2 min-h-[32px]">
                      {service.description || "Aucun descriptif technique fourni."}
                    </p>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Prix Mensuel</p>
                        <p className="text-xl font-bold text-slate-900 leading-none">
                          {(service.monthly_price || 0).toLocaleString("fr-FR")} <span className="text-xs text-slate-400 ml-1">F</span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {canModifyCatalog && (
                          <button
                            onClick={() => handleDeleteService(service.id, service.label)}
                            className="h-10 w-10 bg-white text-slate-400 hover:text-accent-red rounded-lg flex items-center justify-center border border-slate-100 transition-all shadow-sm active:scale-95"
                            title="Supprimer le service"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleShowClients(service)}
                          className="h-10 w-10 bg-slate-50 text-slate-400 hover:text-primary rounded-lg flex items-center justify-center border border-slate-100 transition-all shadow-sm active:scale-95"
                        >
                          <Users size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}

        {/* Detailed Subscription View (Modal) */}
        <AnimatePresence>
          {selectedService && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedService(null)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="relative w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col h-[85vh] border border-slate-200"
              >
                <div className="p-8 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-primary text-white rounded-lg flex items-center justify-center shadow-sm">
                      <Users size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 leading-tight">{selectedService.label}</h2>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Liste des abonnés actifs</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAddClientForm(!showAddClientForm)}
                      className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                    >
                      <Plus size={14} /> {showAddClientForm ? "Masquer" : "Ajouter"}
                    </button>
                    <button onClick={() => setSelectedService(null)} className="p-2 text-slate-400 hover:text-slate-600 transition-all">
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex-grow overflow-y-auto p-8 custom-scrollbar bg-white">
                  {showAddClientForm && (
                    <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-lg shadow-sm">
                      <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4">Associer un nouveau client</h3>
                      <form onSubmit={handleAddClientToService} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Nom Complet</label>
                          <input required value={newClientFullname} onChange={(e) => setNewClientFullname(e.target.value)} className="w-full p-2.5 bg-white rounded-lg outline-none border border-slate-200 focus:ring-2 ring-primary/20 text-sm font-medium transition-all" placeholder="Jean Dupont" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Ligne / Tracker</label>
                          <input required value={newLineNumber} onChange={(e) => setNewLineNumber(e.target.value)} className="w-full p-2.5 bg-white rounded-lg outline-none border border-slate-200 focus:ring-2 ring-primary/20 text-sm font-medium transition-all" placeholder="01.23..." />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Prix (Optionnel)</label>
                          <input type="number" value={newClientCost} onChange={(e) => setNewClientCost(e.target.value)} className="w-full p-2.5 bg-white rounded-lg outline-none border border-slate-200 focus:ring-2 ring-primary/20 text-sm font-medium transition-all" placeholder={selectedService.monthly_price} />
                        </div>
                        <button type="submit" disabled={addingClient} className="w-full py-2.5 bg-primary text-white rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-primary-hover transition-all flex items-center justify-center gap-2">
                          {addingClient ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={14} />}
                          Associer
                        </button>
                      </form>
                    </div>
                  )}
                  {clientsError && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-[10px] font-bold uppercase tracking-widest rounded-lg flex items-center gap-3 mb-6">
                      <AlertCircle size={16} /> {clientsError}
                    </div>
                  )}

                  {clientsLoading ? (
                    <div className="py-24 flex flex-col items-center justify-center gap-4">
                      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chargement des abonnés...</p>
                    </div>
                  ) : serviceClients.length === 0 ? (
                    <div className="py-24 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                        <Users size={32} />
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 uppercase tracking-widest">Aucun abonné</h4>
                      <p className="text-xs text-slate-500 mt-2 font-medium">Ce service n'a pas encore de clients associés.</p>
                    </div>
                  ) : (
                    <div className="overflow-hidden border border-slate-200 rounded-lg bg-white">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Client / Ligne</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Agent</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tarif</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Statut</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {serviceClients.map((sub) => (
                            <tr key={sub.subscription_id} className="hover:bg-primary/[0.02] transition-colors">
                              <td className="px-8 py-6">
                                <div>
                                  <p className="text-sm font-black text-text-main-light">{sub.full_name}</p>
                                  <p className="text-[10px] text-text-muted-light font-black uppercase tracking-widest mt-0.5">{sub.line_number || "LIGNE INCONNUE"}</p>
                                </div>
                              </td>
                              <td className="px-8 py-6">
                                <span className="inline-flex items-center px-3 py-1.5 rounded-radius-button bg-accent-purple/10 text-accent-purple text-[10px] font-black uppercase tracking-wider">
                                  {sub.agent_login || "AUTO"}
                                </span>
                              </td>
                              <td className="px-8 py-6 text-[10px] font-black text-text-muted-light uppercase tracking-widest">
                                {sub.subscription_date || "---"}
                              </td>
                              <td className="px-8 py-6">
                                <p className="text-sm font-black text-text-main-light">
                                  {(sub.contract_cost || 0).toLocaleString("fr-FR")} <span className="text-[10px] text-primary">F</span>
                                </p>
                              </td>
                              <td className="px-8 py-6">
                                <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border ${sub.status_label === 'Actif' ? 'bg-accent-green/10 text-accent-green border-accent-green/20' : 'bg-bg-light text-text-muted-light border-border-light'}`}>
                                  {sub.status_label}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="p-10 border-t border-border-light bg-bg-light/10 flex justify-end">
                  <Button variant="secondary" onClick={() => setSelectedService(null)} className="!px-12 !py-5 shadow-premium">
                    Fermer la vue
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ─── Modal Nouveau Service ─── */}
        <AnimatePresence>
          {showNewServiceModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowNewServiceModal(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl border border-border-light overflow-hidden"
              >
                {/* Header */}
                <div className="p-8 border-b border-border-light bg-primary/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-primary/10 text-primary rounded-radius-card flex items-center justify-center">
                      <Plus size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-text-main-light tracking-tight">Nouveau Service</h2>
                      <p className="text-[10px] font-black text-text-muted-light uppercase tracking-widest mt-0.5">Ajouter au catalogue</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setShowNewServiceModal(false); setServiceError(""); }}
                    className="p-3 bg-bg-light hover:bg-white rounded-radius-button transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleCreateService} className="p-8 space-y-6">
                  {serviceError && (
                    <div className="p-4 bg-accent-red/10 border border-accent-red/20 rounded-radius-button flex items-center gap-3">
                      <Info size={16} className="text-accent-red shrink-0" />
                      <p className="text-[10px] font-black text-accent-red uppercase tracking-widest">{serviceError}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-text-muted-light uppercase tracking-widest">Code *</label>
                      <input
                        required
                        value={serviceForm.code}
                        onChange={e => setServiceForm(p => ({ ...p, code: e.target.value }))}
                        className="w-full px-5 py-3 bg-bg-light/50 border border-border-light rounded-radius-button outline-none focus:ring-4 ring-primary/10 focus:border-primary transition-all text-sm font-bold shadow-premium"
                        placeholder="email_pro"
                      />
                      <p className="text-[9px] text-text-muted-light font-bold">Identifiant unique (ex: fiber_500)</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-text-muted-light uppercase tracking-widest">Tarif Mensuel (FCFA)</label>
                      <input
                        type="number"
                        min="0"
                        value={serviceForm.monthly_price}
                        onChange={e => setServiceForm(p => ({ ...p, monthly_price: e.target.value }))}
                        className="w-full px-5 py-3 bg-bg-light/50 border border-border-light rounded-radius-button outline-none focus:ring-4 ring-primary/10 focus:border-primary transition-all text-sm font-bold shadow-premium"
                        placeholder="75000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-muted-light uppercase tracking-widest">Libellé *</label>
                    <input
                      required
                      value={serviceForm.label}
                      onChange={e => setServiceForm(p => ({ ...p, label: e.target.value }))}
                      className="w-full px-5 py-3 bg-bg-light/50 border border-border-light rounded-radius-button outline-none focus:ring-4 ring-primary/10 focus:border-primary transition-all text-sm font-bold shadow-premium"
                      placeholder="Installation Fibre Optique"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-muted-light uppercase tracking-widest">Description</label>
                    <textarea
                      value={serviceForm.description}
                      onChange={e => setServiceForm(p => ({ ...p, description: e.target.value }))}
                      rows={3}
                      className="w-full px-5 py-3 bg-bg-light/50 border border-border-light rounded-radius-card outline-none focus:ring-4 ring-primary/10 focus:border-primary transition-all text-sm font-bold resize-none shadow-premium"
                      placeholder="Décrivez ce service (technologie, contenu, livrables...)"
                    />
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => { setShowNewServiceModal(false); setServiceError(""); }}
                      className="flex-1 py-4 text-[10px] font-black text-text-muted-light lineCount:800 uppercase tracking-widest hover:text-primary transition-colors border border-border-light rounded-radius-button"
                    >
                      Annuler
                    </button>
                    <Button type="submit" variant="primary" loading={savingService} icon={Plus} className="flex-1 !py-4 shadow-primary/30">
                      Créer le Service
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default Services;
