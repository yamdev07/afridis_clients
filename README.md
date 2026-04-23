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

🔁 Workflow Git & miroir ([afridis_clients_2](https://github.com/SamuelSgn25/afridis_clients_2))

**Flux recommandé (comme tu le fais déjà)**  
1. Développer et pousser sur `backend` : `git push origin backend`  
2. Ouvrir / fusionner vers `main` sur le dépôt principal (`origin`).  
3. Après chaque **push sur `main`**, le workflow GitHub Actions (`.github/workflows/ci.yml`) exécute les jobs backend + frontend puis **pousse automatiquement** `main` vers le dépôt miroir.

**Secret obligatoire sur le dépôt principal (`origin`)**  
- Nom : `MIRROR_PUSH_TOKEN`  
- Valeur : un **Personal Access Token** (classic ou fine-grained) avec au minimum le droit d’écriture sur le repo `SamuelSgn25/afridis_clients_2`.  
- Emplacement : GitHub → dépôt principal → **Settings** → **Secrets and variables** → **Actions** → *New repository secret*.

Sans ce secret, le job « Mirror push » échoue volontairement avec un message explicite.

**Pourquoi `git push mirror main` peut être rejeté en local**  
Le message *fetch first* signifie que `main` sur le miroir contient des commits que tu n’as pas dans ton clone (historiques divergents). Le CI contourne ce cas en poussant depuis une copie fraîche et en alignant le miroir sur le `main` du dépôt principal (**push avec `--force` sur la branche `main` du miroir uniquement**).

**Optionnel : remote SSH local**  
Tu peux garder un remote `mirror` pour des poussées manuelles ; en cas de divergence, aligner une fois le miroir sur ton `main` local (à utiliser seulement si le miroir doit redevenir identique à ton `main`) :  
`git push mirror main:main --force-with-lease`
