import React from "react";
import Navbar from "./Navbar";
import { Mail, Phone, Send, MapPin, Globe, Loader2, CheckCircle, Sparkles, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";

export default function Contact() {
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-slate-900 transition-colors duration-500 font-sans selection:bg-primary/20">
      <Navbar />

      <main className="max-w-7xl mx-auto pt-44 lg:pt-56 pb-32 px-6">
        <div className="grid lg:grid-cols-2 gap-24 items-start">

          <section className="space-y-16">
            <header>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-3 px-6 py-2.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-10 border border-primary/20 shadow-sm"
              >
                <Sparkles size={14} /> Intelligence Connectée
              </motion.div>
              <h1 className="text-6xl lg:text-7xl font-black text-slate-900 mb-10 tracking-tight leading-[1.05]">
                Votre projet <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-purple animate-gradient">notre mission.</span>
              </h1>
              <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg">
                Une demande technique ou un besoin stratégique ? Notre équipe d'experts mobilise les meilleures solutions pour votre croissance.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ContactInfoCard
                icon={Mail}
                title="Direction Email"
                value="contact@clientflow.com"
                desc="Temps de réponse : < 4h"
                color="bg-primary/10 text-primary border-primary/20"
              />
              <ContactInfoCard
                icon={Phone}
                title="SLA Téléphonique"
                value="+225 27 00 00 00"
                desc="Disponible 24h/24 (Abonnés)"
                color="bg-accent-green/10 text-accent-green border-accent-green/20"
              />
              <ContactInfoCard
                icon={MapPin}
                title="Expansion"
                value="Abidjan / Lomé"
                desc="Quartier des Affaires"
                color="bg-accent-purple/10 text-accent-purple border-accent-purple/20"
              />
              <ContactInfoCard
                icon={MessageCircle}
                title="Live Chat"
                value="Canal ClientFlow"
                desc="Réponse instantanée"
                color="bg-accent-orange/10 text-accent-orange border-accent-orange/20"
              />
            </div>
          </section>

          <section>
            <GlassCard className="p-10 lg:p-14 border-slate-200 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] relative overflow-hidden rounded-[40px]" hover={true}>
              {/* Animated accent bar */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-accent-purple to-accent-orange bg-[length:200%_auto] animate-gradient" />

              <AnimatePresence mode="wait">
                {sent ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="py-16 text-center space-y-8"
                  >
                    <div className="w-24 h-24 bg-accent-green/10 text-accent-green rounded-[32px] flex items-center justify-center mx-auto border-2 border-accent-green/20 shadow-xl shadow-accent-green/10">
                      <CheckCircle size={48} strokeWidth={2.5} />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight">Signal Envoyé !</h3>
                      <p className="text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">
                        Nous avons bien reçu votre transmission. Un expert ClientFlow vous répondra par signal prioritaire.
                      </p>
                    </div>
                    <Button variant="secondary" className="!bg-slate-100 !text-slate-600 font-black uppercase tracking-widest text-[10px]" onClick={() => setSent(false)}>Envoyer un nouveau message</Button>
                  </motion.div>
                ) : (
                  <form key="form" onSubmit={handleSubmit} className="space-y-10">
                    <div className="space-y-8">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-1.5 h-8 bg-primary rounded-full shadow-lg shadow-blue-500/30" />
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Formulaire de Contact</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <InputField label="Identité Complète" placeholder="Ex: Marc DUPONT" required />
                        <InputField label="Adresse de réponse" type="email" placeholder="m.dupont@orange.com" required />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Sujet de la transmission</label>
                        <div className="relative">
                          <select className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[20px] text-xs font-black text-slate-900 focus:bg-white focus:ring-8 ring-primary/5 focus:border-primary outline-none transition-all appearance-none cursor-pointer uppercase tracking-[0.15em]">
                            <option>Audit de Flux</option>
                            <option>Architecture CRM</option>
                            <option>Partenariat Orange</option>
                            <option>Support Niveau 2</option>
                          </select>
                          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                            <Send size={14} className="rotate-90" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Détails de la demande</label>
                        <textarea
                          rows="6"
                          placeholder="Décrivez votre besoin avec précision..."
                          className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[20px] text-xs font-bold text-slate-900 focus:bg-white focus:ring-8 ring-primary/5 focus:border-primary outline-none transition-all resize-none placeholder:text-slate-300"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      loading={loading}
                      className="w-full !py-6 !rounded-[22px] shadow-2xl shadow-blue-500/30 uppercase tracking-[0.3em] text-[11px] font-black"
                      icon={Send}
                    >
                      Transmettre maintenant
                    </Button>
                  </form>
                )}
              </AnimatePresence>
            </GlassCard>
          </section>

        </div>
      </main>

      <footer className="py-20 border-t border-slate-100 text-center bg-slate-50/50">
        <div className="flex items-center justify-center gap-2 mb-8 opacity-40 grayscale group hover:grayscale-0 hover:opacity-100 transition-all duration-700">
          <Globe size={16} />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Présence Globale • Paris Abidjan Dubaï</span>
        </div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">© 2026 CLIENTFLOW CRM. UNIVERSE OF EFFICIENCY.</p>
      </footer>
    </div>
  );
}

function ContactInfoCard({ icon: Icon, title, value, desc, color }) {
  return (
    <GlassCard className="p-8 border-slate-100 group relative overflow-hidden" hover={true}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 border shadow-sm ${color}`}>
        <Icon size={28} strokeWidth={2.5} />
      </div>
      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 leading-none">{title}</h4>
      <p className="text-lg font-black text-slate-900 mb-2 tracking-tight">{value}</p>
      <p className="text-[10px] font-bold text-slate-500 tracking-wide leading-relaxed">{desc}</p>
      <div className="absolute -bottom-8 -right-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700">
        <Icon size={120} />
      </div>
    </GlassCard>
  );
}

function InputField({ label, type = "text", ...props }) {
  return (
    <div className="space-y-3 group/field">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 group-focus-within/field:text-primary transition-colors">{label}</label>
      <input
        type={type}
        className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[20px] text-xs font-bold text-slate-900 focus:bg-white focus:ring-8 ring-primary/5 focus:border-primary outline-none transition-all placeholder:text-slate-300 shadow-sm"
        {...props}
      />
    </div>
  );
}
