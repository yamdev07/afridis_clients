import React from "react";
import { Shield, Lock, Database, Globe, CheckCircle2 } from "lucide-react";
import Navbar from "./Navbar";

const sections = [
  {
    title: "Champ d'application",
    body:
      "Cette politique de confidentialite s'applique aux donnees traitees via ClientFlow, y compris les donnees de comptes utilisateurs, de clients, de prospects, de journaux techniques, de securite et de support. Elle est concue pour s'aligner sur les principes internationalement reconnus de protection des donnees, notamment la licite, la loyaute, la transparence, la minimisation, l'exactitude, la limitation de conservation, l'integrite, la confidentialite et la responsabilite.",
    icon: Globe,
  },
  {
    title: "Base juridique et conformite",
    body:
      "Au Benin, les traitements sont conduits en tenant compte du Code du numerique de la Republique du Benin, notamment ses dispositions relatives a la protection des donnees a caractere personnel et de la vie privee. Pour les utilisateurs ou organisations soumis a d'autres cadres, ClientFlow est egalement pense pour soutenir les exigences generales issues des reglementations internationales, y compris les obligations de transparence, de securisation, de gestion des droits des personnes et de gouvernance des incidents.",
    icon: Shield,
  },
  {
    title: "Donnees collectees",
    body:
      "Nous pouvons traiter des donnees d'identification, des donnees de contact, des donnees commerciales, des donnees d'abonnement, des donnees de facturation, des donnees de journalisation, des donnees d'authentification et des informations necessaires au support ou a la prevention de la fraude. Les donnees sensibles ne doivent pas etre chargees dans la plateforme sauf necessite legale ou contractuelle clairement documentee.",
    icon: Database,
  },
  {
    title: "Finalites de traitement",
    body:
      "Les donnees sont traitees pour fournir le service, administrer les comptes, gerer les clients et abonnements, produire des tableaux de bord, assurer la tracabilite des operations, envoyer des notifications, prevenir les acces non autorises, respecter les obligations legales, resoudre les incidents et ameliorer la qualite du service.",
    icon: CheckCircle2,
  },
  {
    title: "Droits des personnes",
    body:
      "Les personnes concernees peuvent, selon le cadre juridique applicable, demander l'acces a leurs donnees, leur rectification, leur mise a jour, l'opposition a certains traitements, la limitation, l'effacement lorsqu'il est juridiquement possible, ainsi que la portabilite lorsque les conditions sont reunies. Les demandes doivent etre traitees dans un delai raisonnable, avec verification de l'identite du demandeur.",
    icon: Lock,
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-slate-900">
      <Navbar />
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="mb-16">
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-primary mb-4">
              Politique de Confidentialite
            </p>
            <h1 className="text-4xl lg:text-6xl font-black tracking-tight mb-6">
              Protection des donnees et respect de la vie privee
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed max-w-3xl">
              Cette politique explique comment ClientFlow collecte, utilise, protege, conserve et partage les donnees personnelles dans un cadre conforme aux exigences generales de protection des donnees, avec une attention particuliere au Code du numerique beninois.
            </p>
          </div>

          <div className="space-y-8">
            {sections.map((section) => (
              <section key={section.title} className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex items-start gap-5">
                  <div className="h-14 w-14 shrink-0 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <section.icon size={26} strokeWidth={2.4} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight mb-3">{section.title}</h2>
                    <p className="text-slate-600 leading-relaxed">{section.body}</p>
                  </div>
                </div>
              </section>
            ))}
          </div>

          <section className="mt-8 rounded-[28px] border border-slate-200 bg-slate-50 p-8">
            <h2 className="text-2xl font-black tracking-tight mb-4">Conservation, transferts et securite</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Les donnees ne sont conservees que pour la duree necessaire aux finalites poursuivies, a l'execution contractuelle, a la defense des droits, a la preuve des operations ou aux obligations legales et reglementaires. Les transferts hors du pays ou hors de la juridiction d'origine doivent etre encadres par des garanties appropriees, des mesures de securite renforcees et une documentation interne adaptee.
            </p>
            <p className="text-slate-600 leading-relaxed">
              ClientFlow met en oeuvre des mesures techniques et organisationnelles raisonnables pour proteger les donnees contre la destruction, la perte, l'alteration, la divulgation non autorisee, l'acces illicite ou l'usage non conforme. Ces mesures incluent notamment la gestion des roles, la journalisation, la limitation des acces, la sauvegarde, l'authentification, la surveillance des incidents et les procedures de reprise.
            </p>
          </section>

          <section className="mt-8 rounded-[28px] border border-primary/20 bg-primary/5 p-8">
            <h2 className="text-2xl font-black tracking-tight mb-4">Contact et reclamations</h2>
            <p className="text-slate-700 leading-relaxed">
              Toute demande relative aux donnees personnelles, a la vie privee, a la rectification des informations ou a une reclamation de securite doit etre adressee a l'administrateur du service ou au point de contact conformite indique par l'organisation exploitante. Au Benin, les personnes concernees peuvent egalement se rapprocher de l'autorite competente en matiere de protection des donnees si elles estiment que leurs droits n'ont pas ete respectes.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
