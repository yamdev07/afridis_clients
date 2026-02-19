import React, { useState } from "react";
import "../styles/Authentification.css";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import { api } from "../api/clientflow";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    // password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!isLogin) {
        await api.register(form.name, form.email, form.password);
      }
      await api.login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

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

            <form className="auth-form" onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="form-group">
                  <label>Nom complet</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Jean Dupont"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label>E-mail</label>
                <input
                  type="email"
                  name="email"
                  placeholder="jean@exemple.fr"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Mot de passe</label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="form-control"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"
                    }
                    title={
                      showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"
                    }
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              {/* <div className="form-group">
                <label>Confirmation du mot de passe</label>
                <input
                  type="password"
                  name="password_confirmation"
                  value={form.password_confirmation}
                  onChange={handleChange}
                  required
                />
              </div> */}
              
              {isLogin && (
                <div className="form-checkbox">
                  <input type="checkbox" id="remember" />
                  <label htmlFor="remember">Rester connecté</label>
                </div>
              )}

              {error && <p className="text-danger mb-2">{error}</p>}

              <button
                type="submit"
                className="btn btn--primary auth-submit"
                disabled={loading}
              >
                {loading
                  ? "Traitement..."
                  : isLogin
                  ? "Se connecter"
                  : "Créer mon compte"}
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