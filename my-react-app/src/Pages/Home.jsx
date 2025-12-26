import React from "react";
import Navbar from "./Navbar";
import "../styles/Home.css";

export default function Home() {
  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        {/* HERO */}
        <section className="hero-section">
          <div className="hero-background-gradient" />

          <div className="hero-grid">
            <div className="hero-text">
              <p className="hero-subtitle">Plateforme CRM moderne pour équipes ambitieuses</p>

              <h1 className="hero-title">
                Donnez de la clarté
                <span className="hero-title-secondary">à chaque relation client.</span>
              </h1>

              <p className="hero-description">
                ClientFlow centralise contacts, rendez-vous et relances dans une interface claire.
                Vous savez toujours qui contacter, quand, avec quel historique.
              </p>

              <div className="hero-buttons">
                <button
                  className="btn-primary"
                  onClick={() => document.getElementById("cta")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Lancer une démo
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => document.getElementById("workflow")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Voir comment ça marche
                </button>
              </div>

              <div className="hero-trial-info">
                <span className="trial-dot" />
                Pas de CB • Essai gratuit 14 jours
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="dashboard-preview">
              <div className="dashboard-card">
                <div className="dashboard-header">
                  <div className="dashboard-title">
                    <span className="status-dot" />
                    Pipeline clients
                  </div>
                  <span className="dashboard-date">Cette semaine</span>
                </div>

                <div className="stats-grid">
                  <div className="stat-card active-clients">
                    <p>Clients actifs</p>
                    <p className="stat-value">124</p>
                    <p className="stat-trend positive">+18 ce mois</p>
                  </div>
                  <div className="stat-card follow-ups">
                    <p>Relances à faire</p>
                    <p className="stat-value">32</p>
                    <p className="stat-trend warning">12 en retard</p>
                  </div>
                  <div className="stat-card satisfaction">
                    <p>Satisfaction</p>
                    <p className="stat-value">4,8/5</p>
                    <p className="stat-trend positive">+0,3 vs N-1</p>
                  </div>
                </div>

                <div className="tasks-card">
                  <div className="tasks-header">
                    <span>Relances du jour</span>
                    <span>08 tâches</span>
                  </div>
                  <div className="tasks-list">
                    <div className="task-item"><span>Rappeler Martin Dupont</span><span className="task-time success">09:30</span></div>
                    <div className="task-item"><span>Envoyer devis agence Nova</span><span className="task-time warning">11:00</span></div>
                    <div className="task-item"><span>Relance facture - Studio Pixel</span><span className="task-time muted">15:00</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="features-section">
          <div className="section-container">
            <div className="section-header">
              <p className="section-subtitle">Fonctionnalités clés</p>
              <h2 className="section-title">
                Tout votre suivi client,
                <span className="section-title-secondary">dans un seul outil minimaliste.</span>
              </h2>
            </div>

            <div className="features-grid">
              {[
                { title: "Fiches clients complètes", desc: "Contacts, notes, documents et historique des échanges rassemblés sur une seule page claire." },
                { title: "Rappels automatiques", desc: "Planifiez vos relances et laissez ClientFlow vous notifier au bon moment, sur tous vos clients." },
                { title: "Vue pipeline simple", desc: "Suivez vos prospects et clients par étape : nouveau, en cours, à relancer, fidélisé." },
                { title: "Fil d'activités", desc: "Une timeline par client avec tous les e-mails, appels, rendez-vous et tâches associées." },
                { title: "Modèles d'e-mails", desc: "Gagnez du temps avec des messages prêts à l’emploi pour les relances et suivis standards." },
                { title: "Statistiques essentielles", desc: "Identifiez rapidement qui relancer et quels clients génèrent le plus de valeur." },
              ].map((f, i) => (
                <div key={i} className="feature-card">
                  <p className="feature-index">0{i + 1}</p>
                  <h3 className="feature-title">{f.title}</h3>
                  <p className="feature-desc">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WORKFLOW */}
        <section id="workflow" className="workflow-section">
          <div className="section-container workflow-grid">
            <div className="workflow-text">
              <p className="section-subtitle">Un flux simple</p>
              <h2 className="section-title">
                De la prise de contact
                <span className="section-title-secondary">jusqu'à la fidélisation.</span>
              </h2>
              <p className="workflow-desc">
                ClientFlow se glisse dans votre quotidien sans ajouter de complexité. Trois étapes
                suffisent pour garder une vision claire sur l'ensemble de votre portefeuille clients.
              </p>

              <div className="workflow-steps">
                {["Ajoutez ou importez vos contacts en quelques clics.", "Planifiez vos relances et vos rendez-vous.", "Suivez l'historique et mesurez vos résultats."].map((step, i) => (
                  <div key={i} className="step-item">
                    <span className="step-number">{i + 1}</span>
                    <p>{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="workflow-image-card">
              <div className="workflow-image-header">
                <span>Vue clients</span>
                <span>Aujourd'hui</span>
              </div>
              <div className="status-list">
                {["Nouveau lead", "En discussion", "À relancer", "Client fidèle"].map((status, i) => (
                  <div key={status} className="status-item">
                    <div className="status-label">
                      <span className={`status-dot-color status-dot-${i}`} />
                      <span>{status}</span>
                    </div>
                    <span>{["18 contacts", "27 contacts", "12 contacts", "67 contacts"][i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIAL */}
        <section id="testimonial" className="testimonial-section">
          <div className="section-container testimonial-container">
            <p className="section-subtitle">Ils utilisent déjà ClientFlow</p>
            <p className="testimonial-intro">
              Pensé pour les indépendants, petites agences, cabinets de conseil, coaches et toutes
              les équipes qui veulent un outil simple pour bien suivre leurs clients.
            </p>

            <div className="testimonial-card">
              <p className="testimonial-quote">
                "Depuis que nous utilisons ClientFlow, plus aucun client n'est oublié dans un fichier
                Excel. Toute l'équipe sait qui relancer, quand et avec quel historique. On a gagné
                un temps fou et la relation est beaucoup plus professionnelle."
              </p>
              <div className="testimonial-author">
                <p>Amel Benyahia</p>
                <p>Fondatrice de l'agence Nova Conseil</p>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING / CTA FINAL */}
        <section id="cta" className="cta-section">
          <div className="section-container cta-grid">
            <div className="pricing-text">
              <p className="section-subtitle">Tarification simple</p>
              <h2 className="section-title">
                Un abonnement clair,
                <span className="section-title-secondary">sans engagement caché.</span>
              </h2>
              <p className="pricing-desc">
                Testez ClientFlow gratuitement pendant 14 jours. Ensuite, un tarif unique adapté aux
                indépendants, petites équipes et structures en croissance.
              </p>

              <div className="pricing-features">
                <div className="feature-item"><span className="check-green">✓</span> Annulable à tout moment</div>
                <div className="feature-item"><span className="check-indigo">✓</span> Support par e-mail sous 24h</div>
              </div>
            </div>

            <div className="pricing-card">
              <p className="pricing-label">Offre lancement</p>
              <div className="pricing-amount">
                <p>19FCFA</p>
                <span>/mois HT</span>
              </div>
              <p className="pricing-details">
                Pour 1 à 3 utilisateurs, toutes les fonctionnalités incluses.
              </p>

              <button className="btn-cta">Créer mon espace ClientFlow</button>

              <p className="pricing-note">
                Aucun engagement. Facturation mensuelle simple.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>© 2025 ClientFlow. Tous droits réservés.</p>
        <p className="footer-links">Politique de confidentialité · Mentions légales</p>
      </footer>
    </div>
  );
}