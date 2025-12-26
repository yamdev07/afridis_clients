import React, { useState } from "react";
import "../styles/FAQ.css";
import Navbar from "./Navbar";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      q: "ClientFlow est-il adapté aux indépendants ?",
      a: "Oui ! ClientFlow a été conçu pour les indépendants, consultants, coaches et petites agences qui veulent un outil simple sans complexité superflue."
    },
    {
      q: "Puis-je importer mes contacts existants ?",
      a: "Absolument. Vous pouvez importer vos contacts via un fichier CSV ou Excel en quelques clics depuis l’interface."
    },
    {
      q: "Y a-t-il un engagement de durée ?",
      a: "Non. L’abonnement est mensuel et annulable à tout moment depuis votre espace client."
    },
    {
      q: "Combien d’utilisateurs peuvent utiliser un compte ?",
      a: "Jusqu’à 3 utilisateurs inclus dans l’offre unique à 19€/mois. Pour plus d’utilisateurs, contactez-nous."
    },
    {
      q: "Mes données sont-elles sécurisées ?",
      a: "Oui. Toutes les données sont chiffrées et hébergées en Europe (France). Nous respectons strictement le RGPD."
    },
    {
      q: "Proposez-vous un support client ?",
      a: "Oui, support par e-mail sous 24h ouvrés. Un chat en direct sera bientôt disponible."
    }
  ];

  return (
    <div className="page-container">
        <Navbar />
      <section className="faq-section">
        <div className="container">
          <div className="section-header text-center">
            <p className="section-subtitle">FAQ</p>
            <h1 className="page-title">Questions fréquentes</h1>
            <p className="page-intro">
              Tout ce que vous devez savoir avant de commencer avec ClientFlow.
            </p>
          </div>

          <div className="faq-list">
            {faqs.map((item, index) => (
              <div
                key={index}
                className={`faq-item ${openIndex === index ? "open" : ""}`}
                onClick={() => toggle(index)}
              >
                <div className="faq-question">
                  <h3>{item.q}</h3>
                  <span className="faq-toggle">{openIndex === index ? "−" : "+"}</span>
                </div>
                <div className="faq-answer">
                  <p>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
