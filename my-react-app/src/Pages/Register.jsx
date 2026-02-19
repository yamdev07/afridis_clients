import React, { useState } from "react";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import { api } from "../api/clientflow";
import "../styles/Authentification.css";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (api.register) {
        await api.register(form.name, form.email, form.password);
      }
      if (api.login) {
        await api.login(form.email, form.password);
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Erreur d'inscription");
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
              <h1 className="auth-title">Créer un compte ClientFlow</h1>
              <p className="auth-subtitle">
                Créez votre espace ClientFlow et démarrez votre essai gratuit
                de 14 jours.
              </p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nom complet</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Nom et prénom"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>E-mail</label>
                <input
                  type="email"
                  name="email"
                  placeholder="vous@exemple.com"
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

              {error && <p className="text-danger mb-2">{error}</p>}

              <button
                type="submit"
                className="btn btn--primary auth-submit"
                disabled={loading}
              >
                {loading ? "Inscription..." : "Créer un compte"}
              </button>

              <p className="auth-terms">
                En créant un compte, vous acceptez nos{" "}
                <a href="#">Conditions d’utilisation</a> et notre{" "}
                <a href="#">Politique de confidentialité</a>.
              </p>
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

