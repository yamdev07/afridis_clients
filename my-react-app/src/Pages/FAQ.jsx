import React, { useState } from "react";
import Navbar from "./Navbar";
import { Plus, Minus, HelpCircle, MessageCircle, ArrowRight, Sparkles, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "ClientFlow est-il adapté aux structures Orange ?",
      a: "Parfaitement. ClientFlow a été spécifiquement architecturé pour répondre aux exigences des commerciaux et gestionnaires de flottes, avec une intégration native des flux de rapports d'installation Orange."
    },
    {
      q: "Comment s'opère la synchronisation des données ?",
      a: "Nos algorithmes synchronisent vos rapports en temps réel. Que ce soit via import Excel ou saisie manuelle, la plateforme consolide les données pour une visibilité immédiate sur vos KPIs."
    },
    {
      q: "Puis-je personnaliser mes tableaux de bord ?",
      a: "Chaque utilisateur peut configurer son interface. Les graphiques Recharts s'adaptent dynamiquement à vos filtres pour vous offrir la lecture la plus pertinente de votre activité."
    },
    {
      q: "Quid de la sécurité des données clients ?",
      a: "Nous appliquons un chiffrement AES-256. Les protocoles de sécurité sont audités trimestriellement pour garantir une étanchéité totale de vos informations sensibles."
    },
    {
      q: "Le support technique est-il réactif ?",
      a: "Un support de Niveau 2 est accessible directement depuis votre dashboard. Nous garantissons une prise en charge sous 2 heures pour les incidents bloquants."
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-slate-900 transition-colors duration-500 font-sans selection:bg-primary/20">
      <Navbar />

      <main className="max-w-4xl mx-auto pt-44 lg:pt-56 pb-32 px-6">
        <header className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 px-6 py-2.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-10 border border-primary/20 shadow-sm"
          >
            <Sparkles size={14} /> Base de Connaissance
          </motion.div>
          <h1 className="text-5xl lg:text-7xl font-black text-slate-900 mb-10 tracking-tight leading-none">Intelligence <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-purple animate-gradient">Partagée.</span></h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
            Toutes les ressources nécessaires pour maîtriser l'écosystème ClientFlow et optimiser votre efficacité opérationnelle.
          </p>
        </header>

        <section className="space-y-6">
          {faqs.map((faq, index) => (
            <GlassCard
              key={index}
              className={`overflow-hidden transition-all duration-500 border-slate-200 rounded-[28px] ${openIndex === index ? 'ring-4 ring-primary/5 bg-white shadow-2xl' : 'hover:border-primary/20 hover:bg-white'}`}
              hover={true}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left px-10 py-8 flex items-center justify-between gap-6 group"
              >
                <span className={`text-xl font-black tracking-tight transition-colors duration-500 ${openIndex === index ? 'text-primary' : 'text-slate-900'}`}>
                  {faq.q}
                </span>
                <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${openIndex === index ? 'bg-primary text-white rotate-180 shadow-lg shadow-blue-500/30' : 'bg-slate-100 text-slate-400 group-hover:text-primary group-hover:bg-primary/10'}`}>
                  <ChevronDown size={24} strokeWidth={3} />
                </div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                  >
                    <div className="px-10 pb-10 text-slate-500 leading-relaxed font-medium text-lg border-t border-slate-100 pt-8 mx-10">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          ))}
        </section>

        <GlassCard className="mt-24 p-12 lg:p-16 bg-primary rounded-[48px] text-white flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl shadow-blue-500/40 border-none relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-20 opacity-10 group-hover:rotate-12 transition-transform duration-1000">
            <MessageCircle size={300} />
          </div>
          <div className="text-center md:text-left relative z-10">
            <h3 className="text-3xl lg:text-4xl font-black mb-4 tracking-tight">Question sans réponse ?</h3>
            <p className="text-blue-100 text-lg font-medium opacity-80 leading-relaxed">Notre unité de support prioritaire est en ligne pour vous.<br />Temps d'attente estimé : &lt; 2 min.</p>
          </div>
          <Button variant="secondary" className="!bg-white !text-primary !border-none !py-6 !px-12 !text-sm uppercase tracking-[0.2em] font-black hover:scale-105 shadow-xl relative z-10" icon={MessageCircle}>
            Lancer le Chat Live
          </Button>
        </GlassCard>
      </main>

      <footer className="py-20 border-t border-slate-100 text-center bg-slate-50/50">
        <div className="flex items-center justify-center gap-3 mb-8 opacity-40 grayscale group hover:grayscale-0 hover:opacity-100 transition-all duration-700">
          <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Support Technique Opérationnel 24/7/365</span>
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">© 2026 CLIENTFLOW CRM. EMPOWERING GROWTH.</p>
      </footer>
    </div>
  );
}
