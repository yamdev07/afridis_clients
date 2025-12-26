import React, { useState } from "react";
import "../styles/Authentification.css";
import Navbar from "./Navbar";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="page-container auth-page">
        <Navbar />
      <section className="auth-section">
        <div className="container">
          <div className="auth-card">
            <div className="auth-header text-center">
              <h1 className="auth-title">
                {isLogin ? "Bienvenue sur ClientFlow" : "Créez votre compte"}
              </h1>
              <p className="auth-subtitle">
                {isLogin
                  ? "Connectez-vous pour accéder à votre espace."
                  : "Commencez votre essai gratuit de 14 jours."}
              </p>
            </div>

            <div className="auth-toggle">
              <button
                className={isLogin ? "active" : ""}
                onClick={() => setIsLogin(true)}
              >
                Connexion
              </button>
              <button
                className={!isLogin ? "active" : ""}
                onClick={() => setIsLogin(false)}
              >
                Inscription
              </button>
            </div>

            <form className="auth-form">
              {!isLogin && (
                <div className="form-group">
                  <label>Nom complet</label>
                  <input type="text" placeholder="Jean Dupont" required />
                </div>
              )}

              <div className="form-group">
                <label>E-mail</label>
                <input type="email" placeholder="jean@exemple.fr" required />
              </div>

              <div className="form-group">
                <label>Mot de passe</label>
                <input type="password" required />
              </div>

              {isLogin && (
                <div className="form-checkbox">
                  <input type="checkbox" id="remember" />
                  <label htmlFor="remember">Rester connecté</label>
                </div>
              )}

              <button type="submit" className="btn btn--primary auth-submit">
                {isLogin ? "Se connecter" : "Créer mon compte"}
              </button>

              {isLogin && (
                <p className="auth-forgot">
                  <a href="#">Mot de passe oublié ?</a>
                </p>
              )}

              {!isLogin && (
                <p className="auth-terms">
                  En créant un compte, vous acceptez nos{" "}
                  <a href="#">Conditions d’utilisation</a> et notre{" "}
                  <a href="#">Politique de confidentialité</a>.
                </p>
              )}
            </form>

            <p className="auth-trial-note">
              Essai gratuit 14 jours • Aucune carte bancaire requise
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}