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
  Loader2,
  XCircle,
  Hash,
  Calendar,
  Fingerprint,
  Settings,
  Lock,
  Eye,
  EyeOff,
  X,
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

  // Modal mot de passe
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current: "", next: "", confirm: "" });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      // Appel API réel vers PUT /auth/me
      const updated = await api.updateProfile({ name: form.name, email: form.email, phone: form.phone });
      const merged = { ...user, ...updated };
      setUser(merged);
      // Mise à jour du localStorage pour que les infos soient restaurées à la reconnexion
      localStorage.setItem("user", JSON.stringify(merged));
      setSuccess("Profil synchronisé et sauvegardé en base de données.");
    } catch (err) {
      setError(err?.response?.data?.message || "Échec de la mise à jour des informations.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwdError("");
    setPwdSuccess("");

    if (pwdForm.next !== pwdForm.confirm) {
      setPwdError("Les deux nouveaux mots de passe ne correspondent pas.");
      return;
    }
    if (pwdForm.next.length < 6) {
      setPwdError("Le nouveau mot de passe doit faire au moins 6 caractères.");
      return;
    }

    setPwdSaving(true);
    try {
      await api.changeOwnPassword(pwdForm.current, pwdForm.next);
      setPwdSuccess("Mot de passe modifié avec succès !");
      setPwdForm({ current: "", next: "", confirm: "" });
    } catch (err) {
      setPwdError(err?.response?.data?.message || "Erreur lors du changement de mot de passe.");
    } finally {
      setPwdSaving(false);
    }
  };

  const closePwdModal = () => {
    setShowPwdModal(false);
    setPwdForm({ current: "", next: "", confirm: "" });
    setPwdError("");
    setPwdSuccess("");
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
    <div className="flex min-h-screen bg-bg-light font-inter transition-colors duration-500">
      <Sidebar />

      <main className="flex-grow p-4 lg:p-10 overflow-y-auto custom-scrollbar">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-text-main-light tracking-tight">Mon Profil</h1>
            <p className="text-text-muted-light mt-2 font-medium">Gérez votre identité numérique et vos accès sur ClientFlow.</p>
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
                  <div className="h-40 w-40 rounded-[32px] bg-primary flex items-center justify-center text-white text-5xl font-black border-8 border-bg-light shadow-premium overflow-hidden transition-transform group-hover:scale-105">
                    {user.name?.charAt(0) || user.email?.charAt(0) || "?"}
                  </div>
                  <button className="absolute -bottom-2 -right-2 p-4 bg-bg-light shadow-premium rounded-radius-button text-primary border border-border-light hover:scale-110 active:scale-95 transition-all">
                    <Camera size={20} />
                  </button>
                </div>

                <h2 className="text-2xl font-black text-text-main-light tracking-tight leading-none group-hover:text-primary transition-colors">{user.name || "Utilisateur"}</h2>
                <p className="text-[10px] font-black text-text-muted-light uppercase tracking-widest mt-3">{user.email}</p>

                <div className="mt-6 flex items-center gap-3 px-5 py-2 bg-primary/10 rounded-full text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20 shadow-premium">
                  <Fingerprint size={14} strokeWidth={3} /> {roleLabel}
                </div>

                <div className="w-full h-px bg-border-light my-10" />

                <div className="w-full space-y-6">
                  <ProfileMetric icon={Hash} label="Matricule" value={user.agent_login || "—"} />
                  <ProfileMetric icon={Calendar} label="Membre depuis" value={user.created_at ? new Date(user.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "—"} />
                </div>
              </GlassCard>

              <GlassCard className="p-8 border-accent-orange/10 bg-accent-orange/[0.02] shadow-premium rounded-radius-card" hover={true}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-accent-orange/20 text-accent-orange rounded-radius-button">
                    <Bell size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xs font-black text-text-main-light uppercase tracking-widest">Alerte & Monitoring</h3>
                </div>
                <p className="text-[11px] text-text-muted-light leading-relaxed font-bold">
                  Restez informé des synchronisations de rapports et des succès d'installations.
                </p>
                <div className="mt-6 p-4 bg-bg-light rounded-radius-button border border-border-light flex items-center justify-between shadow-premium">
                  <span className="text-[10px] font-black text-text-muted-light uppercase tracking-[0.2em]">Flux RSS Actif</span>
                  <div className="h-2 w-2 rounded-full bg-accent-green animate-pulse" />
                </div>
              </GlassCard>
            </div>

            {/* Profile Form Content */}
            <div className="lg:col-span-8 space-y-10">
              <GlassCard className="p-10 border-border-light shadow-premium rounded-radius-card" hover={true}>
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-2 h-10 bg-primary rounded-full shadow-lg shadow-primary/40" />
                  <h3 className="text-2xl font-black text-text-main-light tracking-tight">Configuration Identité</h3>
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
                  </div>

                  <div className="pt-10 border-t border-border-light flex flex-col sm:flex-row items-center justify-between gap-6">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-3 text-xs font-black text-text-muted-light hover:text-accent-red transition-all uppercase tracking-widest"
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
                      <h3 className="text-xl font-black text-text-main-light tracking-tight">Sécurité du Compte</h3>
                      <p className="text-[10px] font-black text-text-muted-light uppercase tracking-widest mt-1">Gérez votre mot de passe et vos accès</p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    icon={Settings}
                    className="w-full md:w-auto !py-4 shadow-premium"
                    onClick={() => setShowPwdModal(true)}
                  >
                    Gérer la sécurité
                  </Button>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Changement de Mot de Passe */}
      <AnimatePresence>
        {showPwdModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePwdModal}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden border border-border-light"
            >
              {/* Header */}
              <div className="p-8 border-b border-border-light bg-accent-purple/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-accent-purple/10 text-accent-purple rounded-radius-button flex items-center justify-center">
                    <Lock size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-text-main-light tracking-tight">Changer le mot de passe</h2>
                    <p className="text-[10px] font-black text-text-muted-light uppercase tracking-widest mt-0.5">Sécurité du compte</p>
                  </div>
                </div>
                <button
                  onClick={closePwdModal}
                  className="p-3 bg-bg-light hover:bg-white rounded-radius-button transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handlePasswordChange} className="p-8 space-y-6">
                <AnimatePresence>
                  {pwdSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-4 bg-accent-green/10 border border-accent-green/20 rounded-radius-button flex items-center gap-3"
                    >
                      <CheckCircle className="text-accent-green shrink-0" size={18} strokeWidth={3} />
                      <p className="text-xs font-black text-accent-green uppercase tracking-widest">{pwdSuccess}</p>
                    </motion.div>
                  )}
                  {pwdError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-4 bg-accent-red/10 border border-accent-red/20 rounded-radius-button flex items-center gap-3"
                    >
                      <XCircle className="text-accent-red shrink-0" size={18} strokeWidth={3} />
                      <p className="text-xs font-black text-accent-red uppercase tracking-widest">{pwdError}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Current Password */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted-light uppercase tracking-widest">Mot de passe actuel</label>
                  <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted-light" size={18} />
                    <input
                      type={showCurrent ? "text" : "password"}
                      required
                      value={pwdForm.current}
                      onChange={(e) => setPwdForm(p => ({ ...p, current: e.target.value }))}
                      className="w-full pl-14 pr-14 py-4 bg-bg-light/50 border border-border-light rounded-radius-button outline-none focus:ring-4 ring-primary/10 focus:border-primary transition-all text-sm font-bold shadow-premium"
                      placeholder="Votre mot de passe actuel"
                    />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-5 top-1/2 -translate-y-1/2 text-text-muted-light hover:text-primary transition-colors">
                      {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted-light uppercase tracking-widest">Nouveau mot de passe</label>
                  <div className="relative">
                    <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted-light" size={18} />
                    <input
                      type={showNext ? "text" : "password"}
                      required
                      value={pwdForm.next}
                      onChange={(e) => setPwdForm(p => ({ ...p, next: e.target.value }))}
                      className="w-full pl-14 pr-14 py-4 bg-bg-light/50 border border-border-light rounded-radius-button outline-none focus:ring-4 ring-primary/10 focus:border-primary transition-all text-sm font-bold shadow-premium"
                      placeholder="Au moins 6 caractères"
                    />
                    <button type="button" onClick={() => setShowNext(!showNext)} className="absolute right-5 top-1/2 -translate-y-1/2 text-text-muted-light hover:text-primary transition-colors">
                      {showNext ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted-light uppercase tracking-widest">Confirmer le nouveau mot de passe</label>
                  <div className="relative">
                    <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted-light" size={18} />
                    <input
                      type="password"
                      required
                      value={pwdForm.confirm}
                      onChange={(e) => setPwdForm(p => ({ ...p, confirm: e.target.value }))}
                      className={`w-full pl-14 pr-6 py-4 bg-bg-light/50 border rounded-radius-button outline-none focus:ring-4 ring-primary/10 transition-all text-sm font-bold shadow-premium ${pwdForm.confirm && pwdForm.next !== pwdForm.confirm ? "border-accent-red/50 focus:border-accent-red" : "border-border-light focus:border-primary"}`}
                      placeholder="Répétez le nouveau mot de passe"
                    />
                    {pwdForm.confirm && (
                      <div className="absolute right-5 top-1/2 -translate-y-1/2">
                        {pwdForm.next === pwdForm.confirm
                          ? <CheckCircle size={18} className="text-accent-green" />
                          : <XCircle size={18} className="text-accent-red" />
                        }
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={closePwdModal}
                    className="flex-1 py-4 text-[10px] font-black text-text-muted-light uppercase tracking-widest hover:text-primary transition-colors border border-border-light rounded-radius-button"
                  >
                    Annuler
                  </button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={pwdSaving}
                    icon={Lock}
                    className="flex-1 !py-4 shadow-primary/30"
                  >
                    Modifier
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProfileMetric({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between text-left group/metric">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-radius-button bg-bg-light text-text-muted-light transition-colors group-hover/metric:text-primary shadow-premium border border-border-light">
          <Icon size={18} strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-[9px] font-black text-text-muted-light uppercase tracking-widest mb-0.5">{label}</p>
          <p className="text-sm font-black text-text-main-light tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, name, icon: Icon, type = "text", value, onChange, placeholder }) {
  return (
    <div className="space-y-3 group/field">
      <label className="text-[10px] font-black text-text-muted-light uppercase tracking-[0.2em] ml-1 group-focus-within/field:text-primary transition-colors">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted-light group-focus-within/field:text-primary transition-colors" size={20} strokeWidth={2.5} />
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-14 pr-6 py-4 bg-bg-light/50 border border-border-light rounded-radius-button outline-none focus:ring-4 ring-primary/10 focus:border-primary focus:bg-white transition-all text-sm font-bold text-text-main-light placeholder:text-text-muted-light shadow-premium"
        />
      </div>
    </div>
  );
}
