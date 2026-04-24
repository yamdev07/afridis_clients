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

**Secret obligatoire : où le mettre, et avec quel compte**

Le job « Mirror push » s’exécute sur **le dépôt GitHub qui contient ce workflow** (celui sur lequel tu pousses `main` / `backend`), pas sur ton compte personnel en soi.  
- Si tu contribues sur un dépôt **d’un autre propriétaire** (ex. organisation ou compte tiers) : **seul un administrateur de ce dépôt** peut aller dans **Settings → Secrets and variables → Actions** et créer le secret du PAT sous l’un des noms **`MIRROR_PUSH_TOKEN`** ou **`mirror_repo_token`** (le workflow accepte les deux).  
- La **valeur** du secret doit être un **PAT** créé sur le compte qui a le **droit d’écriture** sur [`SamuelSgn25/afridis_clients_2`](https://github.com/SamuelSgn25/afridis_clients_2) (en pratique : ton compte **SamuelSgn25**, avec un token capable de pousser sur ce repo).

**Contenu du PAT (pour éviter le 403)**  
- **Classic** : scope **`repo`** (accès complet aux repos privés du compte ; pour un repo public, `public_repo` peut suffire pour pousser sur des repos publics dont tu es propriétaire — en cas de doute, utilise `repo`).  
- **Fine-grained** : accès au dépôt **`afridis_clients_2`** uniquement, permission **Contents : Read and write**.  
- Si ton compte ou l’organisation impose **SSO SAML** : après création du PAT, clique sur **Configure SSO** / **Authorize** à côté du token sur la page des tokens GitHub.

**Erreur `403` / `Permission ... denied`**  
Cela veut dire que GitHub refuse le push avec le jeton utilisé : secret vide ou mauvais, token expiré, droits insuffisants, mauvais dépôt sélectionné (fine-grained), ou SSO non autorisé. Ce n’est **pas** le `GITHUB_TOKEN` du dépôt d’origine qui peut pousser vers un autre dépôt : il faut impérativement un PAT dans **`MIRROR_PUSH_TOKEN`** ou **`mirror_repo_token`** (même usage) dans les secrets du dépôt **où tourne l’action**.

Sans secret valide, le job « Mirror push » échoue (message explicite si le secret est absent).

**Pourquoi `git push mirror main` peut être rejeté en local**  
Le message *fetch first* signifie que `main` sur le miroir contient des commits que tu n’as pas dans ton clone (historiques divergents). Le CI contourne ce cas en poussant depuis une copie fraîche et en alignant le miroir sur le `main` du dépôt principal (**push avec `--force` sur la branche `main` du miroir uniquement**).

**Optionnel : remote SSH local**  
Tu peux garder un remote `mirror` pour des poussées manuelles ; en cas de divergence, aligner une fois le miroir sur ton `main` local (à utiliser seulement si le miroir doit redevenir identique à ton `main`) :  
`git push mirror main:main --force-with-lease`
