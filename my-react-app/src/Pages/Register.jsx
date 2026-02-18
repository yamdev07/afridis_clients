import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/clientflow";
import "../styles/Authentification.css";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

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
      await api.register(form.name, form.email, form.password);
      await api.login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Erreur d'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        value={form.name}
        onChange={handleChange}
        required
      />

      <input
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
        required
      />

      <input
        type="password"
        name="password"
        value={form.password}
        onChange={handleChange}
        required
      />

      {error && <p>{error}</p>}

      <button disabled={loading}>
        {loading ? "Inscription..." : "Créer un compte"}
      </button>
    </form>
  );
}
