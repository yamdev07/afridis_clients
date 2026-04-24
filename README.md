📡 ClientFlow

Plateforme de gestion commerciale pour fournisseurs de fibre internet.
ClientFlow est une application web destinée aux entreprises spécialisées dans la fourniture de fibre internet (vente, installation, maintenance et suivi client).
Elle permet de centraliser la gestion des clients, des services fibre, des installations et du travail des agents terrain via une interface moderne et sécurisée.

🚀 Objectif du projet

Créer une solution robuste, professionnelle et évolutive permettant aux entreprises de fourniture de fibre internet de :
- mieux gérer leurs clients
- suivre efficacement les installations
- optimiser le travail des agents
- disposer d’une vision claire de leur activité

🧱 Architecture générale

- Frontend : React.js + Tailwind CSS
- Backend : Node Js Express.js (API REST)
- Base de données : PostgreSQL
- Authentification : JWT
- Type d’application : Dashboard web (desktop-first, responsive)


👥 Gestion des utilisateurs

Rôles
- Administrateur
- Agent

Fonctionnalités
- Création et gestion des comptes utilisateurs
- Authentification sécurisée via JWT
- Gestion des rôles et des permissions
- Accès restreint aux fonctionnalités selon le rôle
- Possibilité de désactiver un compte utilisateur


👤 Gestion des clients

Données client
- Nom du client
- Numéro de téléphone
- Date de souscription
- Date d’installation
- Statut d’installation (installé / non installé)
- Services souscrits
- Observations / commentaires
- Historique des actions

Fonctionnalités
- Création, modification et suppression de clients
- Consultation de la fiche client détaillée
- Recherche par nom ou numéro de téléphone
- Filtrage par statut (installé / non installé)
- Tri par date de souscription ou d’installation
- Historisation des modifications importantes


🌐 Gestion des services fibres

Données service
- Nom du service (ex : Fibre 20 Mbps, Fibre Pro, etc.)
- Description (optionnelle)

Fonctionnalités
- Création et gestion des services proposés
- Association de plusieurs services à un client
- Visualisation des services actifs par client
- Préparation à une facturation future (extensible)


🛠️ Suivi des installations

Données installation
- Client concerné
- Date prévue d’installation
- Date réelle d’installation
- Statut de l’installation
- Agent en charge
- Observations terrain

Fonctionnalités
- Suivi du processus d’installation
- Mise à jour du statut après intervention
- Attribution d’un agent à une installation
- Historique des interventions
- Liste des installations en attente


🧑‍🔧 Gestion des agents

Fonctionnalités
- Liste des agents actifs
- Attribution des clients ou installations aux agents
- Suivi des interventions par agent
- Visualisation de la charge de travail
- Historique des actions effectuées par agent


📊 Dashboard & statistiques

Indicateurs clés
- Nombre total de clients
- Clients installés / non installés
- Nouvelles souscriptions par période
- Installations en attente
- Services les plus souscrits

Fonctionnalités
- Dashboard synthétique dès la connexion
- Graphiques simples (barres, courbes)
- Filtres par période
- Mise à jour en temps réel via API


🔐 Sécurité & API

Backend
- API REST Node Js
- Authentification JWT
- Middleware de contrôle d’accès
- Validation stricte des données
- Gestion des erreurs et réponses normalisées

Base de données
- PostgreSQL normalisé
- Contraintes d’intégrité (FK, uniques)
- Index pour performances
- Séparation logique des entités


🧩 Extensibilité prévue

ClientFlow est conçu pour évoluer vers :
- Gestion de la maintenance réseau
- Suivi des incidents
- Facturation et paiements
- Notifications (SMS / email)
- Version mobile (React Native)
- Multi-entreprises
