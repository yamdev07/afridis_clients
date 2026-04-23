import React, { useEffect, useMemo, useState } from "react";
import RoleBadge from "../components/RoleBadge";
import Sidebar from "./Sidebar";
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Plus,
  UserPlus,
  Mail,
  Key,
  ShieldCheck,
  UserCircle,
  Hash,
  Calendar,
  Users,
  Pencil,
  Trash2,
  Ban,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../api/clientflow";
import Button from "../components/ui/Button";
import GlassCard from "../components/ui/GlassCard";
import NotificationBell from "../components/NotificationBell";

const ROLE_OPTIONS = {
  super_admin: [
    { value: "commercial", label: "Commercial" },
    { value: "admin", label: "Admin" },
    { value: "admin_local", label: "Admin Local" },
    { value: "super_admin", label: "Super Admin" },
  ],
  admin_local: [
    { value: "commercial", label: "Commercial" },
    { value: "admin", label: "Admin" },
  ],
  admin: [{ value: "commercial", label: "Commercial" }],
};

const ROLE_LABELS = {
  super_admin: "Super Admin",
  admin_local: "Admin Local",
  admin: "Admin",
  commercial: "Commercial",
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "commercial",
    agent_login: "",
    company_name: "",
    company_description: "",
    company_rccm: "",
    company_ifu: "",
  });
  const [creating, setCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const currentUser = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("user") || "null")
    : null;

  const allowedRoleOptions = ROLE_OPTIONS[currentUser?.role] || [];
  const formRoleOptions = editingUser && currentUser?.role === 'admin_local'
    ? [...allowedRoleOptions, { value: 'admin_local', label: 'Admin Local' }]
    : allowedRoleOptions;

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.listUsers();
      setUsers(data || []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = search.toLowerCase();
    return users.filter((u) =>
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      ROLE_LABELS[u.role]?.toLowerCase().includes(term)
    );
  }, [search, users]);

  const openCreateModal = () => {
    const defaultRole = allowedRoleOptions[0]?.value || "commercial";
    setEditingUser(null);
    setForm({
      name: "",
      email: "",
      password: "",
      role: defaultRole,
      agent_login: "",
      company_name: "",
      company_description: "",
      company_rccm: "",
      company_ifu: "",
    });
    setShowCreateModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      agent_login: user.agent_login || "",
      company_name: user.company_name || "",
      company_description: user.company_description || "",
      company_rccm: user.company_rccm || "",
      company_ifu: user.company_ifu || "",
    });
    setShowCreateModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingUser(null);
    setForm({
      name: "",
      email: "",
      password: "",
      role: allowedRoleOptions[0]?.value || "commercial",
      agent_login: "",
      company_name: "",
      company_description: "",
      company_rccm: "",
      company_ifu: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    setSuccess("");
    try {
      if (form.role === "admin_local" && (!form.company_name || !form.company_rccm || !form.company_ifu)) {
        setError("Pour un admin local, le nom entreprise, RCCM et IFU sont obligatoires.");
        setCreating(false);
        return;
      }
      if (editingUser) {
        const updated = await api.updateUser(editingUser.id, form);
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
        setSuccess("Utilisateur mis a jour avec succes.");
      } else {
        const created = await api.createUser(form);
        setUsers((prev) => [created, ...prev]);
        setSuccess("Utilisateur cree. L'envoi email depend de la configuration SMTP du serveur deploye.");
      }
      closeModal();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Erreur de sauvegarde");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer l'utilisateur ${user.name} ?`)) return;
    try {
      await api.deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setSuccess("Utilisateur supprime avec succes.");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Erreur de suppression");
    }
  };

  const handleToggleSuspension = async (user) => {
    const nextSuspended = !user.is_suspended;
    const actionLabel = nextSuspended ? "suspendre" : "réactiver";
    if (!window.confirm(`Voulez-vous ${actionLabel} le compte ${user.name} ?`)) return;
    try {
      const updated = await api.setUserSuspension(user.id, nextSuspended);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)));
      setSuccess(nextSuspended ? "Compte suspendu avec succes." : "Compte reactive avec succes.");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Erreur de suspension");
    }
  };

  const canManageUsers = ["super_admin", "admin_local", "admin"].includes(currentUser?.role);

  if (!canManageUsers) {
    return (
      <div className="flex min-h-screen bg-bg-light font-inter transition-colors duration-500">
        <Sidebar />
        <main className="flex-grow p-4 lg:p-10 flex items-center justify-center">
          <GlassCard className="p-12 text-center max-w-md border-accent-red/20 shadow-premium rounded-radius-card" hover={true}>
            <div className="w-24 h-24 bg-accent-red/10 text-accent-red rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-accent-red/20 shadow-lg shadow-accent-red/10">
              <ShieldAlert size={48} strokeWidth={2.5} />
            </div>
            <h2 className="text-[10px] font-black text-text-muted-light mb-4 tracking-[0.2em] uppercase opacity-50">Acces Non Autorise</h2>
            <h3 className="text-2xl font-black text-text-main-light mb-4 tracking-tight">Espace Restreint</h3>
            <p className="text-text-muted-light mb-10 leading-relaxed font-bold">
              Cette zone est reservee aux comptes internes de gestion.
            </p>
            <Button onClick={() => window.history.back()} variant="primary" className="w-full !py-5 shadow-primary/30">
              Quitter la zone
            </Button>
          </GlassCard>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-bg-light font-inter transition-colors duration-500">
      <Sidebar />
      <main className="flex-grow p-4 lg:p-10 overflow-y-auto custom-scrollbar">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-black text-text-main-light tracking-tight">Administration</h1>
              <div className="px-5 py-2 bg-primary/10 border border-primary/20 text-primary rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-premium">
                Niveau {ROLE_LABELS[currentUser?.role] || currentUser?.role}
              </div>
            </div>
            <p className="text-text-muted-light font-medium tracking-tight">Gestion des comptes selon la nouvelle hierarchie locale.</p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <Button icon={Plus} onClick={openCreateModal} className="shadow-primary/30 font-black tracking-widest text-[10px]">
              CREER UN UTILISATEUR
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GlassCard className="p-6 border-border-light shadow-premium rounded-radius-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-radius-button bg-primary/10 text-primary flex items-center justify-center">
                <Users size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted-light">Comptes visibles</p>
                <p className="text-3xl font-black text-text-main-light">{users.length}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-6 border-border-light shadow-premium rounded-radius-card md:col-span-2">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted-light transition-colors group-focus-within:text-primary" size={20} strokeWidth={2.5} />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                className="w-full pl-16 pr-16 py-5 bg-bg-light/50 border border-border-light rounded-radius-button outline-none focus:ring-8 ring-primary/5 focus:bg-white transition-all shadow-premium font-bold text-sm text-text-main-light placeholder:text-text-muted-light"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button onClick={fetchUsers} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-text-muted-light hover:text-primary transition-all">
                <RefreshCw size={18} strokeWidth={2.5} />
              </button>
            </div>
          </GlassCard>
        </div>

        {error && (
          <GlassCard className="mb-6 p-5 bg-accent-red/10 border border-accent-red/20 rounded-radius-button flex items-center gap-4 shadow-premium">
            <XCircle className="text-accent-red" size={20} strokeWidth={3} />
            <p className="text-[11px] font-black text-accent-red uppercase tracking-widest">{error}</p>
          </GlassCard>
        )}

        {success && (
          <GlassCard className="mb-6 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-radius-button flex items-center gap-4 shadow-premium">
            <CheckCircle2 className="text-emerald-600" size={20} strokeWidth={3} />
            <p className="text-[11px] font-black text-emerald-700 uppercase tracking-widest">{success}</p>
          </GlassCard>
        )}

        <section className="bg-bg-light/50 rounded-radius-card border border-border-light shadow-premium overflow-hidden font-bold">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-light border-b border-border-light">
                  <th className="px-10 py-6 text-[10px] font-black text-text-muted-light uppercase tracking-[0.2em]">Utilisateur</th>
                  <th className="px-10 py-6 text-[10px] font-black text-text-muted-light uppercase tracking-[0.2em]">Role</th>
                  <th className="px-10 py-6 text-[10px] font-black text-text-muted-light uppercase tracking-[0.2em]">Entreprise (RCCM / IFU)</th>
                  <th className="px-10 py-6 text-[10px] font-black text-text-muted-light uppercase tracking-[0.2em]">Agent</th>
                  <th className="px-10 py-6 text-[10px] font-black text-text-muted-light uppercase tracking-[0.2em]">Creation</th>
                  <th className="px-10 py-6 text-[10px] font-black text-text-muted-light uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-32 text-center">
                      <RefreshCw className="w-12 h-12 text-primary animate-spin mx-auto mb-6 opacity-40" strokeWidth={3} />
                      <p className="text-[10px] font-black text-text-muted-light uppercase tracking-[0.3em]">Chargement...</p>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-32 text-center text-text-muted-light font-black uppercase tracking-widest text-[10px] opacity-40">
                      Aucun utilisateur pour ce filtre.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-primary/[0.02] transition-colors group">
                      <td className="px-10 py-6 text-text-main-light border-none">
                        <div className="flex items-center gap-5">
                          <div className="h-14 w-14 rounded-radius-button bg-primary/10 text-primary flex items-center justify-center text-xl font-black border border-primary/20 shadow-premium">
                            {u.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-base font-black text-text-main-light tracking-tight leading-none mb-1.5">{u.name}</p>
                            <p className="text-[11px] text-text-muted-light font-bold tracking-tight">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6 border-none">
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="px-10 py-6 border-none">
                        {u.company_name ? (
                          <div className="space-y-1">
                            <p className="text-sm font-black text-text-main-light leading-none">{u.company_name}</p>
                            <p className="text-[10px] text-text-muted-light font-bold uppercase tracking-widest">
                              RCCM: {u.company_rccm || "---"} / IFU: {u.company_ifu || "---"}
                            </p>
                          </div>
                        ) : (
                          <span className="text-text-muted-light/30 font-black uppercase tracking-widest text-[10px]">Aucune entreprise</span>
                        )}
                      </td>
                      <td className="px-10 py-6 text-sm font-black text-text-muted-light border-none">
                        {u.agent_login ? (
                          <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-bg-light text-text-main-light rounded-radius-button text-[11px] font-black uppercase tracking-widest border border-border-light shadow-premium">
                            <Hash size={14} strokeWidth={3} /> {u.agent_login}
                          </div>
                        ) : (
                          <span className="text-text-muted-light/30 font-black uppercase tracking-widest text-[10px]">Non assigne</span>
                        )}
                      </td>
                      <td className="px-10 py-6 border-none">
                        <div className="flex items-center gap-3 text-text-muted-light text-xs font-bold">
                          <Calendar size={16} strokeWidth={2.5} className="opacity-50" />
                          {u.created_at ? new Date(u.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "Inconnue"}
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right border-none">
                        <div className="flex justify-end gap-2">
                          {u.role !== "super_admin" && (
                            <button onClick={() => openEditModal(u)} className="p-3 text-text-muted-light hover:text-primary hover:bg-primary/10 rounded-radius-button transition-all active:scale-90" title="Modifier">
                              <Pencil size={16} />
                            </button>
                          )}
                          {currentUser?.role === "super_admin" && u.role === "admin_local" && (
                            <button
                              onClick={() => handleToggleSuspension(u)}
                              className={`p-3 rounded-radius-button transition-all active:scale-90 ${u.is_suspended ? "text-emerald-600 hover:bg-emerald-100" : "text-amber-600 hover:bg-amber-100"}`}
                              title={u.is_suspended ? "Réactiver le compte entreprise" : "Suspendre le compte entreprise"}
                            >
                              {u.is_suspended ? <RotateCcw size={16} /> : <Ban size={16} />}
                            </button>
                          )}
                          {u.role !== "super_admin" && (
                            <button onClick={() => handleDelete(u)} className="p-3 text-text-muted-light hover:text-accent-red hover:bg-accent-red/10 rounded-radius-button transition-all active:scale-90" title="Supprimer">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <AnimatePresence>
          {showCreateModal && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 sm:p-10">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeModal}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                className="relative w-full max-w-2xl bg-bg-light rounded-radius-card shadow-premium overflow-hidden flex flex-col border border-white/20"
              >
                <div className="p-8 sm:p-12 border-b border-border-light bg-bg-light/80">
                  <div className="flex items-center gap-5 mb-4">
                    <div className="h-14 w-14 bg-primary text-white rounded-radius-button flex items-center justify-center shadow-lg shadow-primary/30">
                      <UserPlus size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-text-main-light tracking-tight">{editingUser ? "Modifier Utilisateur" : "Nouvel Utilisateur"}</h2>
                      <p className="text-text-muted-light font-bold text-sm">Creation et evolution des comptes internes.</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-bold">
                    <InputGroup label="Identite Complete" name="name" icon={UserCircle} value={form.name} onChange={handleChange} placeholder="Ex: Jean Luc DUPONT" required />
                    <InputGroup label="Email Professionnel" name="email" icon={Mail} type="email" value={form.email} onChange={handleChange} placeholder="j.luc@orange.com" required />
                    <InputGroup label="Mot de Passe" name="password" icon={Key} type="password" value={form.password} onChange={handleChange} required={!editingUser} placeholder={editingUser ? "Laisser vide pour ne pas modifier" : ""} />

                    <div className="space-y-3 group/field">
                      <label className="text-[10px] font-black text-text-muted-light uppercase tracking-[0.2em] ml-1 group-focus-within/field:text-primary transition-colors">Privilege Systeme</label>
                      <div className="relative">
                        <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted-light/30 transition-colors group-focus-within/field:text-primary" size={20} strokeWidth={2.5} />
                        <select
                          name="role"
                          className="w-full pl-16 pr-6 py-4 bg-bg-light/50 border border-border-light rounded-radius-button outline-none focus:ring-8 ring-primary/5 focus:bg-white transition-all text-xs font-black text-text-main-light appearance-none uppercase tracking-[0.1em] shadow-premium"
                          value={form.role}
                          onChange={handleChange}
                        >
                          {formRoleOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <InputGroup label="Matricule (Optionnel)" name="agent_login" icon={Hash} value={form.agent_login} onChange={handleChange} placeholder="Ex: AX-1029" />
                    {form.role === "admin_local" && (
                      <>
                        <InputGroup
                          label="Nom Entreprise"
                          name="company_name"
                          icon={UserCircle}
                          value={form.company_name}
                          onChange={handleChange}
                          placeholder="Ex: AFRIDIS BENIN SARL"
                          required
                        />
                        <InputGroup
                          label="RCCM"
                          name="company_rccm"
                          icon={Hash}
                          value={form.company_rccm}
                          onChange={handleChange}
                          placeholder="Ex: RB/COT/22 A 12345"
                          required
                        />
                        <InputGroup
                          label="IFU"
                          name="company_ifu"
                          icon={Hash}
                          value={form.company_ifu}
                          onChange={handleChange}
                          placeholder="Ex: 3201200000000"
                          required
                        />
                        <div className="md:col-span-2 space-y-3 group">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-primary transition-colors">
                            Description Entreprise
                          </label>
                          <textarea
                            name="company_description"
                            value={form.company_description}
                            onChange={handleChange}
                            placeholder="Activites et informations complementaires de l'entreprise..."
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[20px] outline-none focus:ring-8 ring-primary/5 focus:bg-white transition-all text-xs font-black text-slate-900 placeholder:text-slate-300 shadow-sm min-h-28"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="pt-8 border-t border-border-light flex flex-col sm:flex-row justify-end gap-6 font-black uppercase tracking-widest text-[10px]">
                    <button type="button" onClick={closeModal} className="px-10 py-5 text-text-muted-light hover:text-accent-red transition-colors">
                      Annuler
                    </button>
                    <Button type="submit" variant="primary" className="!px-14 !py-5 shadow-primary/30" loading={creating} icon={Plus}>
                      {editingUser ? "Sauvegarder" : "Finaliser la creation"}
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

function InputGroup({ label, name, icon: Icon, type = "text", value, onChange, placeholder, required = false }) {
  return (
    <div className="space-y-3 group">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-primary transition-colors">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <Icon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} strokeWidth={2.5} />
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[20px] outline-none focus:ring-8 ring-primary/5 focus:bg-white transition-all text-xs font-black text-slate-900 placeholder:text-slate-300 shadow-sm"
        />
      </div>
    </div>
  );
}

