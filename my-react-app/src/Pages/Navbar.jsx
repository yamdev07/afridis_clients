import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

export default function Navbar() {
  const location = useLocation(); // Pour savoir sur quelle page on est
  const navigate = useNavigate();  // Pour changer de route

  const handleNavClick = (path, hash = "") => {
    if (location.pathname === path) {
      // Si on est déjà sur la bonne page, on scroll juste à l'ancre
      if (hash) {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // Sinon, on navigue vers la page + ancre
      navigate(path + hash);
      // Petit délai pour laisser le temps à la page de charger avant de scroller
      setTimeout(() => {
        document.getElementById(hash.replace("#", ""))?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo → toujours vers accueil */}
        <div
          className="navbar-logo"
          onClick={() => handleNavClick("/")}
          style={{ cursor: "pointer" }}
        >
          <div className="logo-icon">CF</div>
          <span className="logo-text">ClientFlow</span>
        </div>

        {/* Liens */}
        <ul className="navbar-links">
          <li onClick={() => handleNavClick("/")}>Accueil</li>
          <li onClick={() => handleNavClick("/auth")}>S'inscrire / Se connecter</li>
          <li onClick={() => handleNavClick("/", "#features")}>Fonctionnalités</li>
          <li onClick={() => handleNavClick("/", "#workflow")}>Workflow</li>
          <li onClick={() => handleNavClick("/", "#cta")}>Tarifs</li>
          <li onClick={() => handleNavClick("/faq")}>FAQ</li>
          <li onClick={() => handleNavClick("/contact")}>Contact</li>
        </ul>

        {/* CTA */}
        <button
          className="navbar-cta"
          onClick={() => handleNavClick("/", "#cta")}
        >
          Essai gratuit 14 jours
        </button>

        {/* Burger mobile (à implémenter plus tard si besoin) */}
        <button className="navbar-burger" aria-label="Ouvrir le menu">
          <div className="burger-line"></div>
          <div className="burger-line middle"></div>
          <div className="burger-line"></div>
        </button>
      </div>
    </nav>
  );
}
