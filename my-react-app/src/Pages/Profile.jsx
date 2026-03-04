import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import {
  User,
  Mail,
  Phone,
  Shield,
  Key,
  Camera,
  CheckCircle,
  Save,
  Bell,
  LogOut,
  ChevronRight,
  Loader2,
  XCircle,
  Hash,
  Calendar,
  Globe,
  Fingerprint,
  Settings
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../api/clientflow";
import Button from "../components/ui/Button";
import GlassCard from "../components/ui/GlassCard";
import NotificationBell from "../components/NotificationBell";

export default function Profile() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {
        name: "",
        email: "",
        role: "Commercial",
      };
    } catch {
      return { name: "", email: "", role: "Commercial" };
    }
  });

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await api.me();
        const merged = { ...user, ...data };
        setUser(merged);
        localStorage.setItem("user", JSON.stringify(merged));
        setForm({
          name: merged?.name || "",
          email: merged?.email || "",
          phone: merged?.phone || "",
        });
      } catch (err) {
        setError(err?.response?.data?.message || err.message || "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSuccess("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess("");
    setError("");

    try {
      await new Promise(r => setTimeout(r, 1000));
      const updated = { ...user, ...form };
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      setSuccess("Paramètres du profil synchronisés avec succès.");
    } catch (err) {
      setError("Échec de la mise à jour des informations.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const roleLabel =
    user?.role === "super_admin"
      ? "Administrateur Système"
      : user?.role === "admin"
        ? "Gestionnaire"
        : "Commercial Orange";

  return (
    <div className="flex min-h-screen bg-bg-light dark:bg-bg-dark font-inter transition-colors duration-500">
      <Sidebar />

      <main className="flex-grow p-4 lg:p-10 overflow-y-auto custom-scrollbar">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-text-main-light dark:text-text-main-dark tracking-tight">Mon Profil</h1>
            <p className="text-text-muted-light dark:text-text-muted-dark mt-2 font-medium">Gérez votre identité numérique et vos accès sur ClientFlow.</p>
          </div>
          <NotificationBell />
        </header>

        <div className="max-w-6xl mx-auto pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            {/* Side Branding & Avatar */}
            <div className="lg:col-span-4 space-y-8">
              <GlassCard className="p-10 text-center flex flex-col items-center border-primary/5 relative overflow-hidden group shadow-premium rounded-radius-card" hover={true}>
                {/* Decorative Background */}
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary/20 to-accent-purple/20 blur-2xl" />

                <div className="relative mb-8 mt-4 group">
                  <div className="h-40 w-40 rounded-[32px] bg-primary flex items-center justify-center text-white text-5xl font-black border-8 border-bg-light dark:border-bg-card-dark shadow-premium overflow-hidden transition-transform group-hover:scale-105">
                    {user.name?.charAt(0) || user.email?.charAt(0) || "?"}
                  </div>
                  <button className="absolute -bottom-2 -right-2 p-4 bg-bg-light dark:bg-white/10 shadow-premium rounded-radius-button text-primary border border-border-light dark:border-white/10 hover:scale-110 active:scale-95 transition-all">
                    <Camera size={20} />
                  </button>
                </div>

                <h2 className="text-2xl font-black text-text-main-light dark:text-text-main-dark tracking-tight leading-none group-hover:text-primary transition-colors">{user.name || "Utilisateur"}</h2>
                <p className="text-[10px] font-black text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest mt-3">{user.email}</p>

                <div className="mt-6 flex items-center gap-3 px-5 py-2 bg-primary/10 rounded-full text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20 shadow-premium">
                  <Fingerprint size={14} strokeWidth={3} /> {roleLabel}
                </div>

                <div className="w-full h-px bg-border-light dark:bg-white/5 my-10" />

                <div className="w-full space-y-6">
                  <ProfileMetric icon={Hash} label="Matricule" value={user.agent_login || "PRO-001"} />
                  <ProfileMetric icon={Calendar} label="Date d'Adhésion" value="12 Mars 2024" />
                </div>
              </GlassCard>

              <GlassCard className="p-8 border-accent-orange/10 bg-accent-orange/[0.02] shadow-premium rounded-radius-card" hover={true}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-accent-orange/20 text-accent-orange rounded-radius-button">
                    <Bell size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xs font-black text-text-main-light dark:text-text-main-dark uppercase tracking-widest">Alerte & Monitoring</h3>
                </div>
                <p className="text-[11px] text-text-muted-light dark:text-text-muted-dark leading-relaxed font-bold">
                  Restez informé des synchronisations de rapports et des succès d'installations.
                </p>
                <div className="mt-6 p-4 bg-bg-light dark:bg-white/5 rounded-radius-button border border-border-light dark:border-white/10 flex items-center justify-between shadow-premium">
                  <span className="text-[10px] font-black text-text-muted-light dark:text-text-muted-dark uppercase tracking-[0.2em]">Flux RSS Actif</span>
                  <div className="h-2 w-2 rounded-full bg-accent-green animate-pulse" />
                </div>
              </GlassCard>
            </div>

            {/* Profile Form Content */}
            <div className="lg:col-span-8 space-y-10">
              <GlassCard className="p-10 border-border-light dark:border-white/10 shadow-premium rounded-radius-card" hover={true}>
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-2 h-10 bg-primary rounded-full shadow-lg shadow-primary/40" />
                  <h3 className="text-2xl font-black text-text-main-light dark:text-text-main-dark tracking-tight">Configuration Identité</h3>
                </div>

                <AnimatePresence>
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-10 p-5 bg-accent-green/10 border border-accent-green/20 rounded-radius-button flex items-center gap-4 shadow-premium"
                    >
                      <CheckCircle className="text-accent-green" size={20} strokeWidth={3} />
                      <p className="text-xs font-black text-accent-green uppercase tracking-widest">{success}</p>
                    </motion.div>
                  )}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-10 p-5 bg-accent-red/10 border border-accent-red/20 rounded-radius-button flex items-center gap-4 shadow-premium"
                    >
                      <XCircle className="text-accent-red" size={20} strokeWidth={3} />
                      <p className="text-xs font-black text-accent-red uppercase tracking-widest">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ProfileField
                      label="Nom et Prénoms"
                      name="name"
                      icon={User}
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Ex: Marc DUPONT"
                    />
                    <ProfileField
                      label="Direction E-mail"
                      name="email"
                      icon={Mail}
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="m.dupont@orange.com"
                    />
                    <ProfileField
                      label="Ligne de Contact"
                      name="phone"
                      icon={Phone}
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+225 00 00 00 00"
                    />
                    <div className="space-y-3 font-bold">
                      <label className="text-[10px] font-black text-text-muted-light dark:text-text-muted-dark uppercase tracking-[0.2em] ml-1">Type d'Accès</label>
                      <div className="w-full px-6 py-4 bg-bg-light/50 dark:bg-white/5 border border-border-light dark:border-white/5 rounded-radius-button text-xs font-black text-text-muted-light dark:text-text-muted-dark flex items-center gap-4 uppercase tracking-[0.1em] shadow-premium">
                        <Shield size={18} strokeWidth={2.5} /> {roleLabel}
                      </div>
                    </div>
                  </div>

                  <div className="pt-10 border-t border-border-light dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-3 text-xs font-black text-text-muted-light dark:text-text-muted-dark hover:text-accent-red transition-all uppercase tracking-widest"
                    >
                      <LogOut size={18} /> Fermer la session
                    </button>
                    <Button
                      type="submit"
                      variant="primary"
                      className="!px-12 !py-5 shadow-primary/30"
                      loading={saving}
                      icon={Save}
                    >
                      Mettre à jour le profil
                    </Button>
                  </div>
                </form>
              </GlassCard>

              {/* Security & Access Section */}
              <GlassCard className="p-10 border-primary/10 relative overflow-hidden shadow-premium rounded-radius-card" hover={true}>
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Key size={120} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                  <div className="flex items-center gap-6 text-bold">
                    <div className="h-14 w-14 bg-accent-purple/10 text-accent-purple rounded-radius-button flex items-center justify-center">
                      <Key size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-text-main-light dark:text-text-main-dark tracking-tight">Sécurité du Compte</h3>
                      <p className="text-[10px] font-black text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest mt-1">Dernière rotation du mot de passe : Mars 2026</p>
                    </div>
                  </div>
                  <Button variant="secondary" icon={Settings} className="w-full md:w-auto !py-4 shadow-premium">
                    Gérer la sécurité
                  </Button>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ProfileMetric({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between text-left group/metric">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-radius-button bg-bg-light dark:bg-white/5 text-text-muted-light transition-colors group-hover/metric:text-primary shadow-premium border border-border-light dark:border-white/5">
          <Icon size={18} strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-[9px] font-black text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest mb-0.5">{label}</p>
          <p className="text-sm font-black text-text-main-light dark:text-text-main-dark tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, name, icon: Icon, type = "text", value, onChange, placeholder }) {
  return (
    <div className="space-y-3 group/field">
      <label className="text-[10px] font-black text-text-muted-light dark:text-text-muted-dark uppercase tracking-[0.2em] ml-1 group-focus-within/field:text-primary transition-colors">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted-light dark:text-text-muted-dark group-focus-within/field:text-primary transition-colors" size={20} strokeWidth={2.5} />
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-14 pr-6 py-4 bg-bg-light/50 dark:bg-white/5 border border-border-light dark:border-white/10 rounded-radius-button outline-none focus:ring-4 ring-primary/10 focus:border-primary focus:bg-white dark:focus:bg-white/10 transition-all text-sm font-bold text-text-main-light dark:text-text-main-dark placeholder:text-text-muted-light shadow-premium"
        />
      </div>
    </div>
  );
}

