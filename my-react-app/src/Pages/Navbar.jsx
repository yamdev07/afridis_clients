import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = (path, hash = "") => {
    if (location.pathname === path) {
      if (hash) {
        const id = hash.replace("#", "");
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(path);
      if (hash) {
        setTimeout(() => {
          const id = hash.replace("#", "");
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div
          className="navbar-logo"
          onClick={() => handleNavClick("/")}
          style={{ cursor: "pointer" }}
        >
          <div className="logo-icon">CF</div>
          <span className="logo-text">ClientFlow</span>
        </div>

        <ul className="navbar-links">
          <li onClick={() => handleNavClick("/")}>Accueil</li>
          <li onClick={() => handleNavClick("/", "#features")}>Fonctionnalités</li>
          <li onClick={() => handleNavClick("/", "#workflow")}>Workflow</li>
          <li onClick={() => handleNavClick("/", "#cta")}>Tarifs</li>
          <li onClick={() => handleNavClick("/faq")}>FAQ</li>
          <li onClick={() => handleNavClick("/contact")}>Contact</li>
        </ul>

        <div className="navbar-actions">
          <button
            className="navbar-cta btn btn-primary btn-sm"
            onClick={() => handleNavClick("/login")}
          >
            Connexion
          </button>
        </div>
      </div>
    </nav>
  );
}

