import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Layers,
  Globe,
  Database,
  Star,
  Cpu,
  MousePointer2,
  Sparkles
} from "lucide-react";
import Navbar from "./Navbar";
import Button from "../components/ui/Button";
import GlassCard from "../components/ui/GlassCard";

export default function Home() {
  const navigate = useNavigate();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  const features = [
    {
      title: "Gestion Cloud Native",
      desc: "Centralisez vos clients et services sur une infrastructure performante et accessible partout.",
      icon: Layers,
      color: "text-primary",
      bg: "bg-primary/10"
    },
    {
      title: "Analytics Avancés",
      desc: "Prenez des décisions éclairées grâce à des rapports visuels et des prévisions intelligentes.",
      icon: BarChart3,
      color: "text-accent-purple",
      bg: "bg-accent-purple/10"
    },
    {
      title: "Sécurité de Grade Bancaire",
      desc: "Vos données sont cryptées bout-en-bout avec les protocoles de sécurité les plus rigoureux.",
      icon: Shield,
      color: "text-accent-green",
      bg: "bg-accent-green/10"
    }
  ];

  return (
    <div className="bg-[var(--bg-main)] text-slate-900 font-sans selection:bg-primary/20 selection:text-primary overflow-x-hidden min-h-screen transition-colors duration-500">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 lg:pt-60 lg:pb-40 overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent-purple/10 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-slate-100 border border-slate-200 mb-10 shadow-sm"
            >
              <Sparkles size={16} className="text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">ClientFlow Evolution v2.0</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-6xl lg:text-8xl font-black tracking-tight text-slate-900 mb-8 leading-[1.1]"
            >
              L'excellence du <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent-purple to-primary bg-[length:200%_auto] animate-gradient">
                pilotage client.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="text-lg lg:text-xl text-slate-500 mb-14 leading-relaxed max-w-2xl mx-auto font-medium"
            >
              Plus qu'un CRM, ClientFlow est votre centre de commandement pour transformer chaque interaction en une opportunité de croissance durable.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <Button onClick={() => navigate("/login")} className="w-full sm:w-auto text-sm !py-5 !px-12 uppercase tracking-widest shadow-blue-500/40" icon={ArrowRight}>
                Démarrer Maintenant
              </Button>
              <Button variant="secondary" className="w-full sm:w-auto text-sm !py-5 !px-12 uppercase tracking-widest bg-white border-slate-200" icon={MousePointer2}>
                Découvrir l'Interface
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.6 }}
              className="mt-32 pt-16 border-t border-slate-100 flex flex-col items-center gap-10"
            >
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Propulsé par les technologies de pointe</p>
              <div className="flex flex-wrap justify-center gap-16 opacity-30 transition-opacity hover:opacity-60 duration-500">
                <div className="flex items-center gap-3 text-2xl font-black text-slate-900"><Globe size={28} /> GLOBAL</div>
                <div className="flex items-center gap-3 text-2xl font-black text-slate-900"><Database size={28} /> NEXUS</div>
                <div className="flex items-center gap-3 text-2xl font-black text-slate-900"><Zap size={28} /> PULSE</div>
                <div className="flex items-center gap-3 text-2xl font-black text-slate-900"><Cpu size={28} /> CORE</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-slate-50/50 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight">Intelligence & Précision</h2>
            <p className="text-slate-500 text-lg font-medium">Une suite d'outils conçue pour l'excellence opérationnelle.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((f, i) => (
              <GlassCard key={i} className="p-12 border-slate-200 hover:border-primary/30 transition-all group overflow-hidden" hover={true}>
                <div className={`p-5 rounded-[22px] ${f.bg} ${f.color} w-fit mb-10 transition-all duration-500 group-hover:rotate-[10deg] shadow-sm`}>
                  <f.icon size={36} strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight leading-tight">{f.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium">{f.desc}</p>
                {/* Decorative circle */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-slate-100 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Preview Section */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div {...fadeIn}>
              <div className="w-16 h-2 bg-primary rounded-full mb-8 shadow-lg shadow-blue-500/30" />
              <h2 className="text-4xl lg:text-6xl font-black text-slate-900 mb-10 tracking-tight leading-[1.1]">
                Prenez l'avantage <br />
                <span className="text-primary">avec la Data.</span>
              </h2>
              <div className="space-y-8">
                {[
                  { text: "Croissance des revenus en temps réel", icon: TrendingUpIcon },
                  { text: "Optimisation des entonnoirs de vente", icon: TargetIcon },
                  { text: "Exportation multi-formats (PDF, XLSX)", icon: ExportIcon },
                  { text: "Gouvernance et rôles granulaires", icon: RightsIcon }
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-6 group/item"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-[14px] bg-accent-green/10 text-accent-green flex items-center justify-center transition-transform group-hover/item:scale-110">
                      <CheckCircle2 size={24} strokeWidth={3} />
                    </div>
                    <span className="text-lg font-black text-slate-700 tracking-tight">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-[40px] blur-[80px] transform rotate-3" />
              <GlassCard className="p-5 border-slate-200 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden rounded-[32px]" hover={true}>
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80"
                  alt="Dashboard Preview"
                  className="rounded-[22px] shadow-sm brightness-95 group-hover:scale-[1.02] transition-transform duration-700"
                />
              </GlassCard>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-32">
        <div className="container mx-auto px-6">
          <div className="bg-primary rounded-[48px] p-16 lg:p-28 text-center relative overflow-hidden shadow-2xl shadow-blue-500/30 border border-white/10">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-[0.05] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-purple opacity-[0.2] rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <div className="flex justify-center mb-8">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-primary bg-slate-200 flex items-center justify-center overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                    </div>
                  ))}
                  <div className="w-12 h-12 rounded-full border-4 border-primary bg-primary-dark flex items-center justify-center text-[10px] font-black text-white">
                    +5k
                  </div>
                </div>
              </div>
              <h2 className="text-4xl lg:text-7xl font-black text-white mb-8 tracking-tight">Prêt pour l'excellence ?</h2>
              <p className="text-blue-100 text-lg lg:text-xl mb-14 font-medium">Rejoignez les leaders qui façonnent l'avenir de la gestion client.</p>
              <Button variant="secondary" className="!text-sm uppercase tracking-[0.2em] !py-6 px-16 !text-primary !bg-white hover:!bg-blue-50 shadow-xl" onClick={() => navigate("/login")}>
                Démarrer l'Aventure
              </Button>
              <p className="mt-10 text-blue-200/60 text-[10px] uppercase font-black tracking-widest">Zéro engagement • Support 24/7 • Intégrations Illimitées</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 border-t border-slate-100 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-white font-black shadow-xl shadow-blue-500/10">
                <Zap size={28} fill="currentColor" />
              </div>
              <span className="text-3xl font-black text-slate-900 tracking-tight">ClientFlow</span>
            </div>

            <div className="flex items-center gap-12">
              {["Termes", "Sécurité", "Support", "API"].map(item => (
                <button key={item} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary transition-colors">{item}</button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary transition-all cursor-pointer">
                  <Star size={16} />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-20 pt-10 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">© 2026 CLIENTFLOW CRM. TOUS DROITS RÉSERVÉS.</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-green" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Systèmes Opérationnels (Paris / Abidjan)</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Sub-components for icons to keep code clean
function TrendingUpIcon() { return <Sparkles size={24} /> }
function TargetIcon() { return <Sparkles size={24} /> }
function ExportIcon() { return <Sparkles size={24} /> }
function RightsIcon() { return <Sparkles size={24} /> }