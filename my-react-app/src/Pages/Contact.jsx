import React from "react";
import "../styles/Contact.css";
import Navbar from "./Navbar";

export default function Contact() {
  return (
    <div className="page-container">
        <Navbar />
      <section className="contact-section">
        <div className="container">
          <div className="section-header text-center">
            <p className="section-subtitle">Contact</p>
            <h1 className="page-title">Nous sommes là pour vous aider</h1>
            <p className="page-intro">
              Une question ? Un besoin spécifique ? Envoyez-nous un message, nous répondons sous 24h.
            </p>
          </div>

          <div className="contact-grid">
            <div className="contact-form-card">
              <form className="contact-form">
                <div className="form-group">
                  <label>Nom complet</label>
                  <input type="text" required />
                </div>
                <div className="form-group">
                  <label>E-mail</label>
                  <input type="email" required />
                </div>
                <div className="form-group">
                  <label>Sujet</label>
                  <select required>
                    <option value="">Choisir un sujet</option>
                    <option>Découverte de ClientFlow</option>
                    <option>Support technique</option>
                    <option>Facturation</option>
                    <option>Autre</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea rows="5" required></textarea>
                </div>
                <button type="submit" className="btn btn--primary form-submit">
                  Envoyer le message
                </button>
              </form>
            </div>

            <div className="contact-info">
              <h3>Autres moyens de nous joindre</h3>
              <p><strong>E-mail :</strong> hello@clientflow.fr</p>
              <p><strong>Support prioritaire :</strong> Pour les abonnés uniquement</p>
              <p><strong>Horaires :</strong> Lundi au vendredi, 9h–18h (CET)</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
