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
  LayoutGrid
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

  // Nouveaux états pour le formulaire d'ajout client
  const [newClientFullname, setNewClientFullname] = useState("");
  const [newLineNumber, setNewLineNumber] = useState("");
  const [newClientCost, setNewClientCost] = useState("");

  // Modal création de service
  const [showNewServiceModal, setShowNewServiceModal] = useState(false);
  const [serviceForm, setServiceForm] = useState({ code: "", label: "", description: "", monthly_price: "", is_active: true });
  const [savingService, setSavingService] = useState(false);
  const [serviceError, setServiceError] = useState("");

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

  useEffect(() => {
    fetchServices();
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

  const handleAddClientToService = async (e) => {
    e.preventDefault();
    if (!newClientFullname || !newLineNumber) {
      setClientsError("Nom complet et Numéro de ligne requis");
      return;
    }

    setAddingClient(true);
    setClientsError("");

    try {
      const clientPayload = {
        full_name: newClientFullname,
        address: JSON.stringify({ line_number: newLineNumber })
      };

      const newClientRes = await api.createClient(clientPayload);
      const clientId = newClientRes.id;

      // Créer l'abonnement avec les infos de base
      await api.listSubscriptions(); // juste pour vérifier le token

      // On rafraîchit la liste
      const data = await api.getServiceClients(selectedService.id);
      setServiceClients(data?.data || []);

      setNewClientFullname("");
      setNewLineNumber("");
      setNewClientCost("");
      setShowAddClientForm(false);

    } catch (err) {
      setClientsError(err?.response?.data?.message || "Erreur lors de l'ajout du client");
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
    <div className="flex min-h-screen bg-bg-light dark:bg-bg-dark font-inter transition-colors duration-500">
      <Sidebar />

      <main className="flex-grow p-4 lg:p-10 overflow-y-auto custom-scrollbar">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-text-main-light dark:text-text-main-dark tracking-tight">Services & Offres</h1>
            <p className="text-text-muted-light dark:text-text-muted-dark mt-2 font-medium">Gestion du catalogue et monitoring des souscriptions.</p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="flex gap-3">
              <Button variant="secondary" icon={RefreshCw} onClick={fetchServices} className="!px-5" />
              <Button variant="primary" icon={Plus} className="shadow-primary/30" onClick={() => setShowNewServiceModal(true)}>
                Nouveau Service
              </Button>
            </div>
          </div>
        </header>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <GlassCard className="p-8 flex items-center gap-6" hover={true}>
            <div className="h-16 w-16 bg-primary/10 text-primary rounded-radius-card shadow-sm flex items-center justify-center">
              <Package size={32} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-black text-text-muted-light dark:text-text-muted-dark uppercase tracking-[0.2em] mb-1">Catalog Size</p>
              <h3 className="text-3xl font-black text-text-main-light dark:text-text-main-dark leading-none">{filteredServices.length}</h3>
            </div>
          </GlassCard>

          <GlassCard className="p-8 flex items-center gap-6" hover={true}>
            <div className="h-16 w-16 bg-accent-green/10 text-accent-green rounded-radius-card shadow-sm flex items-center justify-center">
              <TrendingUp size={32} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-black text-text-muted-light dark:text-text-muted-dark uppercase tracking-[0.2em] mb-1">Valeur Catalogue</p>
              <h3 className="text-3xl font-black text-text-main-light dark:text-text-main-dark leading-none">{totalRevenue.toLocaleString("fr-FR")} F</h3>
            </div>
          </GlassCard>

          <GlassCard className="p-8 flex items-center gap-6" hover={true}>
            <div className="h-16 w-16 bg-accent-orange/10 text-accent-orange rounded-radius-card shadow-sm flex items-center justify-center">
              <Users size={32} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-black text-text-muted-light dark:text-text-muted-dark uppercase tracking-[0.2em] mb-1">Services Actifs</p>
              <h3 className="text-3xl font-black text-text-main-light dark:text-text-main-dark leading-none">{filteredServices.filter(s => s.is_active).length}</h3>
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
              className="w-full pl-14 pr-4 py-4 bg-white dark:bg-white/5 border border-border-light dark:border-white/10 rounded-radius-button outline-none focus:ring-4 ring-primary/10 focus:border-primary transition-all shadow-premium font-bold text-text-main-light dark:text-text-main-dark placeholder:text-text-muted-light"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex bg-white dark:bg-white/5 p-1 rounded-radius-button border border-border-light dark:border-white/10 shadow-premium">
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
            <p className="text-[10px] font-black text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest">Synchronisation catalogue...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={service.id}
              >
                <GlassCard className="p-0 border-border-light dark:border-white/10 overflow-hidden group hover:border-primary/50" hover={true}>
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-8">
                      <div className={`p-4 rounded-radius-card transition-all duration-500 group-hover:rotate-6 ${service.is_active ? 'bg-primary/10 text-primary' : 'bg-bg-light dark:bg-white/5 text-text-muted-light'}`}>
                        <Zap size={28} strokeWidth={2.5} />
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${service.is_active ? 'bg-accent-green/10 text-accent-green border-accent-green/20' : 'bg-bg-light dark:bg-white/5 text-text-muted-light border-border-light dark:border-white/10'}`}>
                        {service.is_active ? "Catalogue Actif" : "Archivé"}
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-text-main-light dark:text-text-main-dark group-hover:text-primary transition-colors leading-tight mb-3">
                      {service.label}
                    </h3>
                    <p className="text-sm text-text-muted-light dark:text-text-muted-dark font-bold leading-relaxed line-clamp-3 min-h-[60px]">
                      {service.description || "Aucun descriptif technique fourni pour ce service."}
                    </p>

                    <div className="mt-10 pt-8 border-t border-border-light dark:border-white/5 flex items-end justify-between">
                      <div>
                        <p className="text-[10px] font-black text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest mb-1.5">Forfait mensuel</p>
                        <p className="text-3xl font-black text-text-main-light dark:text-text-main-dark leading-none">
                          {(service.monthly_price || 0).toLocaleString("fr-FR")} <span className="text-sm text-primary">F</span>
                        </p>
                      </div>
                      <button
                        onClick={() => handleShowClients(service)}
                        className="h-14 w-14 bg-bg-card-dark dark:bg-white/5 text-white dark:text-primary rounded-radius-button flex items-center justify-center hover:bg-primary hover:text-white dark:hover:bg-primary transition-all shadow-premium active:scale-95"
                      >
                        <Users size={22} />
                      </button>
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
                className="absolute inset-0 bg-bg-dark/40 backdrop-blur-xl"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                className="relative w-full max-w-5xl bg-white dark:bg-bg-dark rounded-[32px] shadow-2xl overflow-hidden flex flex-col h-[85vh] border border-border-light dark:border-white/10"
              >
                <div className="p-10 border-b border-border-light dark:border-white/10 bg-bg-light/10 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 bg-primary text-white rounded-radius-card flex items-center justify-center shadow-xl shadow-primary/30">
                      <Users size={32} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-text-main-light dark:text-text-main-dark tracking-tight">{selectedService.label}</h2>
                      <p className="text-sm text-text-muted-light dark:text-text-muted-dark font-black uppercase tracking-widest mt-1">Base d'abonnés actifs</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={() => setShowAddClientForm(!showAddClientForm)} icon={Plus} variant="secondary" className="shadow-premium">
                      Nouveau Souscripteur
                    </Button>
                    <button onClick={() => setSelectedService(null)} className="p-4 bg-white dark:bg-white/5 hover:bg-bg-light dark:hover:bg-white/10 rounded-radius-button border border-border-light dark:border-white/10 transition-all shadow-premium">
                      <X size={24} />
                    </button>
                  </div>
                </div>

                <div className="flex-grow overflow-y-auto p-10 custom-scrollbar">
                  {showAddClientForm && (
                    <div className="mb-10 p-6 bg-bg-light dark:bg-white/5 border border-primary/20 rounded-radius-card shadow-premium mt-0 animate-in slide-in-from-top-4">
                      <h3 className="text-sm font-black text-text-main-light dark:text-text-main-dark uppercase tracking-widest mb-4">Associer un nouveau client</h3>
                      <form onSubmit={handleAddClientToService} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted-light">Nom Client</label>
                          <input required value={newClientFullname} onChange={(e) => setNewClientFullname(e.target.value)} className="w-full p-4 rounded-radius-button outline-none border border-border-light dark:border-white/10 focus:border-primary text-sm font-bold shadow-sm bg-white dark:bg-bg-dark" placeholder="Jean Dupont" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted-light">Ligne / Tracker</label>
                          <input required value={newLineNumber} onChange={(e) => setNewLineNumber(e.target.value)} className="w-full p-4 rounded-radius-button outline-none border border-border-light dark:border-white/10 focus:border-primary text-sm font-bold shadow-sm bg-white dark:bg-bg-dark" placeholder="01.23..." />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted-light">Tarif négocié (Opt)</label>
                          <input type="number" value={newClientCost} onChange={(e) => setNewClientCost(e.target.value)} className="w-full p-4 rounded-radius-button outline-none border border-border-light dark:border-white/10 focus:border-primary text-sm font-bold shadow-sm bg-white dark:bg-bg-dark" placeholder={selectedService.monthly_price} />
                        </div>
                        <Button loading={addingClient} type="submit" variant="primary" className="!p-4 shadow-primary/30">Associer</Button>
                      </form>
                    </div>
                  )}
                  {clientsError && (
                    <div className="p-5 bg-accent-red/10 border border-accent-red/20 text-accent-red text-[10px] font-black uppercase tracking-widest rounded-radius-card flex items-center gap-3 mb-8">
                      <Info size={18} /> {clientsError}
                    </div>
                  )}

                  {clientsLoading ? (
                    <div className="py-24 flex flex-col items-center justify-center gap-6">
                      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-[10px] font-black text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest">Calcul des données...</p>
                    </div>
                  ) : serviceClients.length === 0 ? (
                    <div className="py-24 text-center">
                      <div className="w-24 h-24 bg-bg-light dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 text-text-muted-light/20">
                        <Users size={48} />
                      </div>
                      <h4 className="text-xl font-black text-text-main-light dark:text-text-main-dark uppercase tracking-widest">Aucune Souscription</h4>
                      <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-3 font-bold">Ce service n'a pas encore de clients associés dans le système.</p>
                    </div>
                  ) : (
                    <div className="overflow-hidden border border-border-light dark:border-white/5 rounded-radius-card shadow-premium bg-white dark:bg-bg-card-dark">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-bg-light/50 dark:bg-white/5 border-b border-border-light dark:border-white/10">
                            <th className="px-8 py-5 text-[10px] font-black text-text-muted-light dark:text-text-muted-dark uppercase tracking-[0.2em]">Client / Ligne</th>
                            <th className="px-8 py-5 text-[10px] font-black text-text-muted-light dark:text-text-muted-dark uppercase tracking-[0.2em]">Affectation</th>
                            <th className="px-8 py-5 text-[10px] font-black text-text-muted-light dark:text-text-muted-dark uppercase tracking-[0.2em]">Date</th>
                            <th className="px-8 py-5 text-[10px] font-black text-text-muted-light dark:text-text-muted-dark uppercase tracking-[0.2em]">Mensualité</th>
                            <th className="px-8 py-5 text-[10px] font-black text-text-muted-light dark:text-text-muted-dark uppercase tracking-[0.2em]">Statut</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light dark:divide-white/5">
                          {serviceClients.map((sub) => (
                            <tr key={sub.subscription_id} className="hover:bg-primary/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                              <td className="px-8 py-6">
                                <div>
                                  <p className="text-sm font-black text-text-main-light dark:text-text-main-dark">{sub.full_name}</p>
                                  <p className="text-[10px] text-text-muted-light dark:text-text-muted-dark font-black uppercase tracking-widest mt-0.5">{sub.line_number || "LIGNE INCONNUE"}</p>
                                </div>
                              </td>
                              <td className="px-8 py-6">
                                <span className="inline-flex items-center px-3 py-1.5 rounded-radius-button bg-accent-purple/10 text-accent-purple text-[10px] font-black uppercase tracking-wider">
                                  {sub.agent_login || "AUTO"}
                                </span>
                              </td>
                              <td className="px-8 py-6 text-[10px] font-black text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest">
                                {sub.subscription_date || "---"}
                              </td>
                              <td className="px-8 py-6">
                                <p className="text-sm font-black text-text-main-light dark:text-text-main-dark">
                                  {(sub.contract_cost || 0).toLocaleString("fr-FR")} <span className="text-[10px] text-primary">F</span>
                                </p>
                              </td>
                              <td className="px-8 py-6">
                                <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border ${sub.status_label === 'Actif' ? 'bg-accent-green/10 text-accent-green border-accent-green/20' : 'bg-bg-light dark:bg-white/5 text-text-muted-light dark:text-text-muted-dark border-border-light dark:border-white/10'}`}>
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

                <div className="p-10 border-t border-border-light dark:border-white/10 bg-bg-light/10 flex justify-end">
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
                className="absolute inset-0 bg-bg-dark/60 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                className="relative w-full max-w-lg bg-white dark:bg-bg-dark rounded-[32px] shadow-2xl border border-border-light dark:border-white/10 overflow-hidden"
              >
                {/* Header */}
                <div className="p-8 border-b border-border-light dark:border-white/10 bg-primary/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-primary/10 text-primary rounded-radius-card flex items-center justify-center">
                      <Plus size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-text-main-light dark:text-text-main-dark tracking-tight">Nouveau Service</h2>
                      <p className="text-[10px] font-black text-text-muted-light uppercase tracking-widest mt-0.5">Ajouter au catalogue</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setShowNewServiceModal(false); setServiceError(""); }}
                    className="p-3 bg-bg-light dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 rounded-radius-button transition-all"
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
                      <label className="text-[10px] font-black text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest">Code *</label>
                      <input
                        required
                        value={serviceForm.code}
                        onChange={e => setServiceForm(p => ({ ...p, code: e.target.value }))}
                        className="w-full px-5 py-3 bg-bg-light/50 dark:bg-white/5 border border-border-light dark:border-white/10 rounded-radius-button outline-none focus:ring-4 ring-primary/10 focus:border-primary transition-all text-sm font-bold shadow-premium"
                        placeholder="email_pro"
                      />
                      <p className="text-[9px] text-text-muted-light font-bold">Identifiant unique (ex: fiber_500)</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest">Tarif Mensuel (FCFA)</label>
                      <input
                        type="number"
                        min="0"
                        value={serviceForm.monthly_price}
                        onChange={e => setServiceForm(p => ({ ...p, monthly_price: e.target.value }))}
                        className="w-full px-5 py-3 bg-bg-light/50 dark:bg-white/5 border border-border-light dark:border-white/10 rounded-radius-button outline-none focus:ring-4 ring-primary/10 focus:border-primary transition-all text-sm font-bold shadow-premium"
                        placeholder="75000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest">Libellé *</label>
                    <input
                      required
                      value={serviceForm.label}
                      onChange={e => setServiceForm(p => ({ ...p, label: e.target.value }))}
                      className="w-full px-5 py-3 bg-bg-light/50 dark:bg-white/5 border border-border-light dark:border-white/10 rounded-radius-button outline-none focus:ring-4 ring-primary/10 focus:border-primary transition-all text-sm font-bold shadow-premium"
                      placeholder="Installation Fibre Optique"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest">Description</label>
                    <textarea
                      value={serviceForm.description}
                      onChange={e => setServiceForm(p => ({ ...p, description: e.target.value }))}
                      rows={3}
                      className="w-full px-5 py-3 bg-bg-light/50 dark:bg-white/5 border border-border-light dark:border-white/10 rounded-radius-card outline-none focus:ring-4 ring-primary/10 focus:border-primary transition-all text-sm font-bold resize-none shadow-premium"
                      placeholder="Décrivez ce service (technologie, contenu, livrables...)"
                    />
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-bg-light dark:bg-white/5 rounded-radius-button border border-border-light dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => setServiceForm(p => ({ ...p, is_active: !p.is_active }))}
                      className={`relative w-12 h-6 rounded-full transition-colors ${serviceForm.is_active ? "bg-accent-green" : "bg-border-light dark:bg-white/20"}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${serviceForm.is_active ? "translate-x-7" : "translate-x-1"}`} />
                    </button>
                    <span className="text-[10px] font-black text-text-main-light dark:text-text-main-dark uppercase tracking-widest">
                      Service {serviceForm.is_active ? "actif" : "inactif"}
                    </span>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => { setShowNewServiceModal(false); setServiceError(""); }}
                      className="flex-1 py-4 text-[10px] font-black text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest hover:text-primary transition-colors border border-border-light dark:border-white/10 rounded-radius-button"
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
