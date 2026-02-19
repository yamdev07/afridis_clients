import React, { useState } from "react";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import "../styles/Authentification.css";
import { api } from "../api/clientflow";

export default function Login() {
  const [form, setForm] = useState({
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
      if (api.login) {
        await api.login(form.email, form.password);
      }
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
              <h1 className="auth-title">Connexion à ClientFlow</h1>
              <p className="auth-subtitle">
                Connectez-vous pour accéder à votre espace (commercial, admin
                ou admin suprême).
              </p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
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

              <div className="form-checkbox">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Rester connecté</label>
              </div>

              {error && <p className="text-danger mb-2">{error}</p>}

              <button
                type="submit"
                className="btn btn--primary auth-submit"
                disabled={loading}
              >
                {loading ? "Connexion..." : "Se connecter"}
              </button>

              <p className="auth-forgot">
                <a href="#">Mot de passe oublié ?</a>
              </p>
            </form>

            <p className="auth-trial-note">
              Accès sécurisé pour tous les rôles de ClientFlow.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

