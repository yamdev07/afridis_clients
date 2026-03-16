import React, { useEffect, useState } from "react";
import RoleBadge from "../components/RoleBadge";
import Sidebar from "./Sidebar";
import {
  Users,
  UserPlus,
  ShieldAlert,
  Mail,
  Key,
  ShieldCheck,
  UserCircle,
  Hash,
  Calendar,
  Search,
  CheckCircle2,
  XCircle,
  MoreVertical,
  ChevronRight,
  ShieldHalf,
  ArrowRight,
  Filter,
  RefreshCw,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../api/clientflow";
import Button from "../components/ui/Button";
import GlassCard from "../components/ui/GlassCard";
import NotificationBell from "../components/NotificationBell";

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
    role: "admin",
    agent_login: "",
  });
  const [creating, setCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const currentUser = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("user") || "null")
    : null;

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
      const created = await api.createUser(form);
      setUsers((prev) => [created, ...prev]);
      setSuccess("Utilisateur créé. Les identifiants ont été envoyés par email (si SMTP configuré).");
      setForm({
        name: "",
        email: "",
        password: "",
        role: "admin",
        agent_login: "",
      });
      setShowCreateModal(false);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Erreur de création");
    } finally {
      setCreating(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      const updated = await api.updateUser(editingUser.id, form);
      setUsers((prev) => prev.map(u => u.id === updated.id ? updated : u));
      setForm({ name: "", email: "", password: "", role: "admin", agent_login: "" });
      setEditingUser(null);
      setShowCreateModal(false);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Erreur de mise à jour");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer l'utilisateur ${user.name} ?`)) return;
    try {
      await api.deleteUser(user.id);
      setUsers(users.filter(u => u.id !== user.id));
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Erreur de suppression");
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: "", // Laisser vide pour ne pas le modifier, sauf si l'utilisateur saisit une valeur
      role: user.role,
      agent_login: user.agent_login || user.agent_id || "",
    });
    setShowCreateModal(true);
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setForm({ name: "", email: "", password: "", role: currentUser?.role === "admin" ? "commercial" : "admin", agent_login: "" });
    setShowCreateModal(true);
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (!currentUser || !["super_admin", "admin"].includes(currentUser.role)) {
    return (
      <div className="flex min-h-screen bg-bg-light font-inter transition-colors duration-500">
        <Sidebar />
        <main className="flex-grow p-4 lg:p-10 flex items-center justify-center">
          <GlassCard className="p-12 text-center max-w-md border-accent-red/20 shadow-premium rounded-radius-card" hover={true}>
            <div className="w-24 h-24 bg-accent-red/10 text-accent-red rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-accent-red/20 shadow-lg shadow-accent-red/10">
              <ShieldAlert size={48} strokeWidth={2.5} />
            </div>
            <h2 className="text-[10px] font-black text-text-muted-light mb-4 tracking-[0.2em] uppercase opacity-50">Accès Non Autorisé</h2>
            <h3 className="text-2xl font-black text-text-main-light mb-4 tracking-tight">Espace Restreint</h3>
            <p className="text-text-muted-light mb-10 leading-relaxed font-bold">
              Désolé, cette zone de haute sécurité est réservée exclusivement à l'administrateur système (Super Admin).
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
                Niveau {currentUser?.role === 'super_admin' ? 'Super-Admin' : 'Admin'}
              </div>
            </div>
            <p className="text-text-muted-light font-medium tracking-tight">Contrôle granulaire des accès et de la hiérarchie système.</p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <Button icon={Plus} onClick={openCreateModal} className="shadow-primary/30 font-black tracking-widest text-[10px]">
              CRÉER UN UTILISATEUR
            </Button>
          </div>
        </header>

        {/* Search & Actions */}
        <div className="flex flex-col md:flex-row gap-6 mb-10">
          <div className="relative flex-grow group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted-light transition-colors group-focus-within:text-primary" size={20} strokeWidth={2.5} />
            <input
              type="text"
              placeholder="Rechercher par identité ou canal mail..."
              className="w-full pl-16 pr-6 py-5 bg-bg-light/50 border border-border-light rounded-radius-button outline-none focus:ring-8 ring-primary/5 focus:bg-white transition-all shadow-premium font-bold text-sm text-text-main-light placeholder:text-text-muted-light"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <button onClick={fetchUsers} className="p-5 bg-bg-light/50 border border-border-light rounded-radius-button text-text-muted-light hover:text-primary transition-all hover:rotate-180 transform duration-500 shadow-premium">
              <RefreshCw size={22} strokeWidth={2.5} />
            </button>
            <button className="p-5 bg-bg-light/50 border border-border-light rounded-radius-button text-text-muted-light hover:text-primary transition-all shadow-premium">
              <Filter size={22} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {error && (
          <GlassCard className="mb-10 p-5 bg-accent-red/10 border border-accent-red/20 rounded-radius-button flex items-center gap-4 shadow-premium">
            <XCircle className="text-accent-red" size={20} strokeWidth={3} />
            <p className="text-[11px] font-black text-accent-red uppercase tracking-widest">{error}</p>
          </GlassCard>
        )}

        {success && (
          <GlassCard className="mb-10 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-radius-button flex items-center gap-4 shadow-premium">
            <CheckCircle2 className="text-emerald-600" size={20} strokeWidth={3} />
            <p className="text-[11px] font-black text-emerald-700 uppercase tracking-widest">{success}</p>
          </GlassCard>
        )}

        <section className="bg-bg-light/50 rounded-radius-card border border-border-light shadow-premium overflow-hidden font-bold">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-light border-b border-border-light">
                  <th className="px-10 py-6 text-[10px] font-black text-text-muted-light uppercase tracking-[0.2em]">Identité Système</th>
                  <th className="px-10 py-6 text-[10px] font-black text-text-muted-light uppercase tracking-[0.2em]">Rôle & Privilèges</th>
                  <th className="px-10 py-6 text-[10px] font-black text-text-muted-light uppercase tracking-[0.2em]">Matricule Agent</th>
                  <th className="px-10 py-6 text-[10px] font-black text-text-muted-light uppercase tracking-[0.2em] text-right">Enregistrement</th>
                  <th className="px-10 py-6 text-[10px] font-black text-text-muted-light uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-32 text-center">
                      <RefreshCw className="w-12 h-12 text-primary animate-spin mx-auto mb-6 opacity-40 shadow-premium rounded-full" strokeWidth={3} />
                      <p className="text-[10px] font-black text-text-muted-light uppercase tracking-[0.3em]">Synchronisation de la base...</p>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-32 text-center text-text-muted-light font-black uppercase tracking-widest text-[10px] opacity-40">
                      Zéro résultat pour cette signature.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-primary/[0.02] transition-colors group">
                      <td className="px-10 py-6 text-text-main-light border-none">
                        <div className="flex items-center gap-5">
                          <div className="h-14 w-14 rounded-radius-button bg-primary/10 text-primary flex items-center justify-center text-xl font-black border border-primary/20 shadow-premium transition-transform group-hover:scale-110">
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
                      <td className="px-10 py-6 text-sm font-black text-text-muted-light border-none">
                        {u.agent_id || u.agent_login ? (
                          <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-bg-light text-text-main-light rounded-radius-button text-[11px] font-black uppercase tracking-widest border border-border-light shadow-premium">
                            <Hash size={14} strokeWidth={3} /> {u.agent_id || u.agent_login}
                          </div>
                        ) : (
                          <span className="text-text-muted-light/30 font-black uppercase tracking-widest text-[10px]">Non Assigné</span>
                        )}
                      </td>
                      <td className="px-10 py-6 border-none">
                        <div className="flex items-center gap-3 text-text-muted-light text-xs font-bold">
                          <Calendar size={16} strokeWidth={2.5} className="opacity-50" />
                          {u.created_at ? new Date(u.created_at).toLocaleDateString("fr-FR", { day: '2-digit', month: 'long', year: 'numeric' }) : "Inconnue"}
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right border-none">
                        <div className="flex justify-end gap-2">
                          {((currentUser.role === 'super_admin' && u.role !== 'super_admin') || (currentUser.role === 'admin' && u.role === 'commercial')) && (
                            <button onClick={() => openEditModal(u)} className="p-3 text-text-muted-light hover:text-accent-purple hover:bg-accent-purple/10 rounded-radius-button transition-all active:scale-90">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                            </button>
                          )}
                          {((currentUser.role === 'super_admin' && u.role !== 'super_admin') || (currentUser.role === 'admin' && u.role === 'commercial')) && (
                            <button onClick={() => handleDelete(u)} className="p-3 text-text-muted-light hover:text-accent-red hover:bg-accent-red/10 rounded-radius-button transition-all active:scale-90">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
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

        {/* Create User Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 sm:p-10">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowCreateModal(false)}
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
                      <p className="text-text-muted-light font-bold text-sm">Définition des droits et credentials d'accès.</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={editingUser ? handleEditSubmit : handleSubmit} className="p-8 sm:p-12 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-bold">
                    <InputGroup label="Identité Complète" name="name" icon={UserCircle} value={form.name} onChange={handleChange} placeholder="Ex: Jean Luc DUPONT" required />
                    <InputGroup label="Email Professionnel" name="email" icon={Mail} type="email" value={form.email} onChange={handleChange} placeholder="j.luc@orange.com" required />
                    <InputGroup label="Clé d'Accès" name="password" icon={Key} type="password" value={form.password} onChange={handleChange} required={!editingUser} placeholder={editingUser ? "(Laisser vide pour ne pas modifier)" : ""} />

                    <div className="space-y-3 group/field">
                      <label className="text-[10px] font-black text-text-muted-light uppercase tracking-[0.2em] ml-1 group-focus-within/field:text-primary transition-colors">Privilèges Système</label>
                      <div className="relative">
                        <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted-light/30 transition-colors group-focus-within/field:text-primary" size={20} strokeWidth={2.5} />
                        <select
                          name="role"
                          className="w-full pl-16 pr-6 py-4 bg-bg-light/50 border border-border-light rounded-radius-button outline-none focus:ring-8 ring-primary/5 focus:bg-white transition-all text-xs font-black text-text-main-light appearance-none uppercase tracking-[0.1em] shadow-premium"
                          value={form.role}
                          onChange={handleChange}
                          disabled={currentUser?.role === "admin"}
                        >
                          <option value="commercial">Commercial de Terrain</option>
                          {currentUser?.role === 'super_admin' && <option value="admin">Administrateur Local</option>}
                          {currentUser?.role === 'super_admin' && <option value="super_admin">Super Administrateur</option>}
                        </select>
                      </div>
                    </div>

                    <InputGroup label="Matricule (Optionnel)" name="agent_login" icon={Hash} value={form.agent_login} onChange={handleChange} placeholder="Ex: AX-1029" />
                  </div>

                  <div className="pt-8 border-t border-border-light flex flex-col sm:flex-row justify-end gap-6 font-black uppercase tracking-widest text-[10px]">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-10 py-5 text-text-muted-light hover:text-accent-red transition-colors"
                    >
                      Interrompre
                    </button>
                    <Button
                      type="submit"
                      variant="primary"
                      className="!px-14 !py-5 shadow-primary/30"
                      loading={creating}
                      icon={Plus}
                    >
                      {editingUser ? "Sauvegarder" : "Finaliser la création"}
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

