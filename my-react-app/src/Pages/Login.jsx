import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, ArrowRight, Home as HomeIcon, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { api } from "../api/clientflow";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import { useTheme } from "../context/ThemeContext";

export default function Login() {
  const { theme } = useTheme();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 bg-bg-light overflow-hidden font-inter transition-colors duration-500">

      {/* Background Animated Blobs - Official Palette Gradients */}
      <motion.div
        animate={{
          x: [0, 80, 0],
          y: [0, 40, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[10%] -left-[10%] w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full pointer-events-none"
      />
      <motion.div
        animate={{
          x: [0, -60, 0],
          y: [0, 70, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 2 }}
        className="absolute -bottom-[10%] -right-[10%] w-[700px] h-[700px] bg-accent-purple/15 blur-[130px] rounded-full pointer-events-none"
      />

      <Link to="/" className="fixed top-8 left-8 p-3 glass-card !rounded-2xl hover:scale-110 transition-transform z-50 text-text-main-light flex items-center gap-2 font-bold text-sm bg-white/40 border-white/20">
        <HomeIcon size={18} /> Accueil
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-lg z-10"
      >
        <div className="p-10 md:p-14 rounded-[24px] bg-white/70 backdrop-blur-lg border border-white/30 shadow-2xl relative overflow-hidden group">
          {/* Subtle line decoration */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />

          <div className="text-center mb-10">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-radius-card bg-primary text-white shadow-2xl shadow-primary/30 mb-8"
            >
              <Lock size={36} />
            </motion.div>
            <h1 className="text-4xl font-black text-text-main-light mb-3 tracking-tight">Accès CRM</h1>
            <p className="text-text-muted-light font-medium">Connectez-vous à votre espace <span className="text-primary font-bold">ClientFlow</span></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-text-muted-light ml-1">Identifiant E-mail</label>
              <div className="relative group/input">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted-light group-focus-within/input:text-primary transition-colors" size={20} />
                <input
                  type="email"
                  name="email"
                  placeholder="nom@entreprise.com"
                  className="w-full pl-14 pr-4 py-4.5 bg-bg-light/50 border border-border-light rounded-radius-input outline-none focus:ring-4 ring-primary/10 focus:border-primary focus:bg-white transition-all text-text-main-light font-bold placeholder:text-text-muted-light/50"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-text-muted-light ml-1">Mot de passe</label>
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-[11px] font-black uppercase tracking-widest text-primary hover:text-primary-hover transition-colors"
                >
                  Oublié ?
                </button>
              </div>
              <div className="relative group/input">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted-light group-focus-within/input:text-primary transition-colors" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="w-full pl-14 pr-14 py-4.5 bg-bg-light/50 border border-border-light rounded-radius-input outline-none focus:ring-4 ring-primary/10 focus:border-primary focus:bg-white transition-all text-text-main-light font-bold placeholder:text-text-muted-light/50"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-text-muted-light hover:text-primary transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs font-bold rounded-radius-card flex items-center gap-3"
              >
                <AlertCircle size={18} /> {error}
              </motion.div>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full !py-5 !rounded-radius-button bg-primary hover:bg-primary-hover text-lg shadow-xl shadow-primary/20 border-0"
              icon={ArrowRight}
            >
              Connexion sécurisée
            </Button>
          </form>

          <div className="mt-12 pt-8 border-t border-border-light text-center flex items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-[10px] text-text-muted-light font-black uppercase tracking-widest">
              <CheckCircle2 size={12} className="text-accent-green" /> Sécurisé SSL
            </div>
            <div className="flex items-center gap-2 text-[10px] text-text-muted-light font-black uppercase tracking-widest">
              <CheckCircle2 size={12} className="text-accent-green" /> Chiffré AES
            </div>
          </div>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {forgotOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setForgotOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md"
            >
              <div className="p-10 bg-white border border-border-light rounded-[24px] shadow-2xl">
                <h3 className="text-2xl font-black text-text-main-light mb-2">Récupération</h3>
                <p className="text-sm text-text-muted-light mb-8 font-medium">
                  Saisissez votre e-mail pour réinitialiser vos accès.
                </p>

                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted-light" size={18} />
                    <input
                      type="email"
                      placeholder="E-mail de récupération"
                      className="w-full pl-12 pr-4 py-4 bg-bg-light border border-border-light rounded-radius-input outline-none focus:border-primary text-text-main-light font-bold"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted-light" size={18} />
                    <input
                      type="password"
                      placeholder="Nouveau mot de passe"
                      className="w-full pl-12 pr-4 py-4 bg-bg-light border border-border-light rounded-radius-input outline-none focus:border-primary text-text-main-light font-bold"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                    />
                  </div>
                </div>

                {forgotMessage && (
                  <p className={`mt-4 text-xs font-bold ${forgotMessage.includes("Succès") ? "text-accent-green" : "text-accent-red"}`}>
                    {forgotMessage}
                  </p>
                )}

                <div className="flex gap-4 mt-10">
                  <Button
                    variant="ghost"
                    className="flex-1 !bg-transparent !text-text-muted-light hover:!text-text-main-light"
                    onClick={() => setForgotOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    loading={forgotLoading}
                    className="flex-1 !bg-primary hover:!bg-primary-hover"
                    onClick={async () => {
                      setForgotLoading(true);
                      setForgotMessage("");
                      try {
                        await api.forgotPassword(forgotEmail, forgotNewPassword);
                        setForgotMessage("Succès ! Mot de passe mis à jour.");
                        setTimeout(() => setForgotOpen(false), 2000);
                      } catch (err) {
                        setForgotMessage("Erreur : Compte non trouvé.");
                      } finally {
                        setForgotLoading(false);
                      }
                    }}
                  >
                    Valider
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

