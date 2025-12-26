import React from "react";
import "../styles/Navbar.css";

export default function Navbar() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <div className="logo-icon">
            CF
          </div>
          <span className="logo-text">ClientFlow</span>
        </div>

        {/* Liens desktop */}
        <ul className="navbar-links">
          <li onClick={() => scrollTo("home")}>Accueil</li>
          <li onClick={() => scrollTo("about")}>S'inscrire/Se connecter</li>
          <li onClick={() => scrollTo("features")}>Fonctionnalités</li>
          <li onClick={() => scrollTo("workflow")}>Workflow</li>
          <li onClick={() => scrollTo("cta")}>Tarifs</li>
          <li onClick={() => scrollTo("faq")}>FAQ</li>
          <li onClick={() => scrollTo("contact")}>Contact</li>
        </ul>

        {/* CTA desktop */}
        <button
          className="navbar-cta"
          onClick={() => scrollTo("cta")}
        >
          Essai gratuit 14 jours
        </button>

        {/* Burger mobile */}
        <button className="navbar-burger" aria-label="Ouvrir le menu">
          <div className="burger-line"></div>
          <div className="burger-line middle"></div>
          <div className="burger-line"></div>
        </button>
      </div>
    </nav>
  );
}
