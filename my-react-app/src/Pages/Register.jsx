import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Home as HomeIcon, Sparkles, CheckCircle2 } from "lucide-react";
import { api } from "../api/clientflow";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (api.register) {
        await api.register(form.name, form.email, form.password);
      }
      if (api.login) {
        await api.login(form.email, form.password);
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Erreur d'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 bg-slate-950 overflow-hidden font-['Plus_Jakarta_Sans']">
      {/* Background Animated Blobs */}
      <motion.div
        animate={{
          x: [0, -50, 0],
          y: [0, -30, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-[10%] -left-[10%] w-[500px] h-[500px] bg-indigo-600/30 blur-[120px] rounded-full pointer-events-none"
      />
      <motion.div
        animate={{
          x: [0, 60, 0],
          y: [0, -40, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear", delay: 1 }}
        className="absolute -top-[10%] -right-[10%] w-[600px] h-[600px] bg-cyan-600/20 blur-[130px] rounded-full pointer-events-none"
      />

      {/* Floating Sparkles Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: [0, 1, 0], y: -100 }}
            transition={{ duration: 6 + i, repeat: Infinity, delay: i * 1.5 }}
            className="absolute"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
          >
            <Sparkles size={20} className="text-white" />
          </motion.div>
        ))}
      </div>

      <Link to="/" className="fixed top-8 left-8 p-3 glass-card rounded-2xl hover:scale-110 transition-transform z-50 text-white flex items-center gap-2 font-bold text-sm bg-white/5 border-white/10 hover:bg-white/10">
        <HomeIcon size={18} /> Accueil
      </Link>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-[600px] z-10"
      >
        <GlassCard className="p-10 md:p-14 !bg-white/5 !border-white/10 shadow-2xl shadow-black/50 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full -mr-16 -mt-16" />

          <div className="text-center mb-10">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-2xl shadow-indigo-500/20 mb-8"
            >
              <User size={36} />
            </motion.div>
            <h1 className="text-4xl font-black text-white mb-3 tracking-tight">Nouvel Utilisateur</h1>
            <p className="text-slate-400 font-medium">Rejoignez l'écosystème ClientFlow</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Nom Complet</label>
                <div className="relative group/input">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-indigo-400 transition-colors" size={20} />
                  <input
                    type="text"
                    name="name"
                    placeholder="Arouna Koffi"
                    className="w-full pl-14 pr-4 py-5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-4 ring-indigo-500/10 focus:border-indigo-500 focus:bg-white/10 transition-all text-white font-bold placeholder:text-slate-600 placeholder:font-medium"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">E-mail</label>
                <div className="relative group/input">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-indigo-400 transition-colors" size={20} />
                  <input
                    type="email"
                    name="email"
                    placeholder="contact@axian.com"
                    className="w-full pl-14 pr-4 py-5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-4 ring-indigo-500/10 focus:border-indigo-500 focus:bg-white/10 transition-all text-white font-bold placeholder:text-slate-600 placeholder:font-medium"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Mot de passe sécurisé</label>
              <div className="relative group/input">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-indigo-400 transition-colors" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="w-full pl-14 pr-14 py-5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-4 ring-indigo-500/10 focus:border-indigo-500 focus:bg-white/10 transition-all text-white font-bold placeholder:text-slate-600 placeholder:font-medium"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
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
                className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-2xl"
              >
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full py-5 !rounded-2xl !bg-gradient-to-r from-indigo-600 to-indigo-700 hover:scale-[1.02] text-lg shadow-xl shadow-indigo-600/20 !border-0"
              icon={ArrowRight}
            >
              Créer mon espace
            </Button>
          </form>

          <p className="mt-10 text-center text-sm text-slate-500 font-medium">
            Déjà inscrit ? {" "}
            <Link to="/login" className="font-black text-indigo-400 hover:text-indigo-300 transition-colors">
              Se connecter
            </Link>
          </p>

          <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-wider">
              <CheckCircle2 size={14} className="text-emerald-500" /> Sécurisé
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-wider">
              <CheckCircle2 size={14} className="text-emerald-500" /> RGPD Ready
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-wider">
              <CheckCircle2 size={14} className="text-emerald-500" /> 24/7 Support
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

