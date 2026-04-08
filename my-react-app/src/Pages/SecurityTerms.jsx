import React from "react";
import { ShieldCheck, Lock, KeyRound, AlertTriangle, ServerCrash } from "lucide-react";
import Navbar from "./Navbar";

const clauses = [
  {
    title: "Controle des acces",
    text:
      "Les acces a ClientFlow doivent etre attribues selon le principe du moindre privilege, avec une separation claire des roles, une revue reguliere des habilitations et la suppression rapide des acces devenus inutiles.",
    icon: ShieldCheck,
  },
  {
    title: "Authentification et secrets",
    text:
      "Les mots de passe, jetons, cles d'API et informations d'administration doivent etre proteges, renouveles en cas de doute, stockes de maniere sure et jamais diffuses dans des canaux non securises. L'usage d'une authentification forte est recommande pour les comptes privilegies.",
    icon: KeyRound,
  },
  {
    title: "Securite applicative",
    text:
      "L'application doit etre maintenue avec des correctifs de securite reguliers, des revues de code, une validation des entrees, une limitation des acces aux ressources, une journalisation utile et une surveillance des erreurs. Les pratiques de developpement doivent rester compatibles avec les standards reconnus de securite applicative.",
    icon: Lock,
  },
  {
    title: "Gestion des incidents",
    text:
      "Tout incident, acces non autorise, fuite presumee, alteration de donnees ou comportement anormal doit etre documente, contenu, analyse et traite dans les meilleurs delais. Lorsque la loi applicable l'exige, les notifications aux utilisateurs, clients, partenaires ou autorites competentes doivent etre effectuees sans retard injustifie.",
    icon: AlertTriangle,
  },
  {
    title: "Disponibilite et continuite",
    text:
      "Les donnees critiques doivent etre sauvegardees, restaurees periodiquement et protegees contre les pertes accidentelles ou les incidents techniques. Les operations doivent s'appuyer sur des procedures de reprise, de maintenance et de restauration proportionnees au niveau de risque.",
    icon: ServerCrash,
  },
];

export default function SecurityTerms() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-slate-900">
      <Navbar />
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="mb-16">
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-primary mb-4">
              Termes de Securite
            </p>
            <h1 className="text-4xl lg:text-6xl font-black tracking-tight mb-6">
              Exigences minimales de securite et de gouvernance
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed max-w-3xl">
              Ces termes de securite definissent les engagements techniques, organisationnels et operationnels attendus pour l'utilisation de ClientFlow, dans un esprit compatible avec les bonnes pratiques internationales et les obligations applicables au Benin.
            </p>
          </div>

          <div className="space-y-8">
            {clauses.map((clause) => (
              <section key={clause.title} className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex items-start gap-5">
                  <div className="h-14 w-14 shrink-0 rounded-2xl bg-accent-green/10 text-accent-green flex items-center justify-center">
                    <clause.icon size={26} strokeWidth={2.4} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight mb-3">{clause.title}</h2>
                    <p className="text-slate-600 leading-relaxed">{clause.text}</p>
                  </div>
                </div>
              </section>
            ))}
          </div>

          <section className="mt-8 rounded-[28px] border border-slate-200 bg-slate-50 p-8">
            <h2 className="text-2xl font-black tracking-tight mb-4">Engagements de conformite</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              L'organisation exploitante doit maintenir un registre de traitement adapte a ses activites, encadrer les habilitations, conserver des traces utiles des operations critiques, limiter les traitements au strict necessaire et documenter les mesures prises en cas d'incident ou de demande d'exercice des droits.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Ces termes doivent etre lus conjointement avec la politique de confidentialite, les procedures internes de l'organisation et les exigences legales applicables, notamment celles relatives a la protection des donnees, a la cybersecurite, a la preuve numerique et a la responsabilite des acteurs du service.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
