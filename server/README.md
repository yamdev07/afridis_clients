# ClientFlow Backend API

Backend Node.js/Express pour l'application ClientFlow CRM.

## 🚀 Installation

1. Installer les dépendances:
```bash
npm install
```

2. Configurer les variables d'environnement:
```bash
cp .env.example .env
```

Éditer `.env` et remplir les valeurs:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET`, `JWT_REFRESH_SECRET` (générer des clés sécurisées)
- `CORS_ORIGIN` (URL du frontend, ex: `http://localhost:5173`)

3. Initialiser la base de données:
```bash
npm run init-db
```

Cette commande exécute le script SQL pour créer toutes les tables nécessaires.

## 📝 Démarrage

### Mode développement (avec watch):
```bash
npm run dev
```

### Mode production:
```bash
npm start
```

Le serveur démarre sur le port défini dans `.env` (par défaut: 3000).

## 📚 Structure du projet

```
server/
├── src/
│   ├── config/          # Configuration (database, JWT)
│   ├── controllers/      # Contrôleurs (logique métier)
│   ├── database/        # Scripts SQL et initialisation
│   ├── middlewares/     # Middlewares (auth, validation, errors)
│   ├── routes/          # Routes API
│   └── server.js        # Point d'entrée
├── .env.example
├── package.json
└── README.md
```

## 🔐 Authentification

L'API utilise JWT avec access tokens et refresh tokens:
- **Access token**: Expire après 15 minutes, envoyé dans le header `Authorization: Bearer <token>`
- **Refresh token**: Expire après 7 jours, stocké dans un cookie httpOnly sécurisé

### Endpoints d'authentification:
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion (révoque le token)
- `POST /api/auth/refresh` - Rafraîchir l'access token
- `GET /api/auth/me` - Obtenir l'utilisateur actuel

## 📊 Routes API

### Clients
- `GET /api/clients` - Liste des clients (avec pagination et recherche)
- `GET /api/clients/:id` - Détails d'un client
- `GET /api/clients/line/:line_number` - Client par numéro de ligne
- `POST /api/clients` - Créer un client
- `PUT /api/clients/:id` - Modifier un client
- `DELETE /api/clients/:id` - Supprimer un client

### Services
- `GET /api/services` - Liste des services
- `GET /api/services/:id` - Détails d'un service (avec liste des abonnés)
- `POST /api/services` - Créer un service (admin uniquement)
- `PUT /api/services/:id` - Modifier un service (admin uniquement)
- `DELETE /api/services/:id` - Supprimer un service (admin uniquement)

### Abonnements (Subscriptions)
- `GET /api/subscriptions` - Liste des abonnements
- `GET /api/subscriptions/:id` - Détails d'un abonnement
- `POST /api/subscriptions` - Créer un abonnement
- `PUT /api/subscriptions/:id` - Modifier un abonnement
- `DELETE /api/subscriptions/:id` - Supprimer un abonnement

### Dashboard
- `GET /api/dashboard` - Résumé du dashboard (stats)

## 🔒 Sécurité

- **Helmet**: Protection des headers HTTP
- **CORS**: Configuration sécurisée pour le frontend
- **Rate limiting**: Limite de 100 requêtes par IP toutes les 15 minutes
- **JWT**: Tokens signés et vérifiés
- **Password hashing**: bcrypt avec salt rounds = 10
- **Token blacklist**: Révocation des tokens lors du logout
- **Validation**: express-validator pour valider les données

## 🗄️ Base de données

Tables principales:
- `users` - Utilisateurs (avec rôles: super_admin, admin, commercial)
- `clients` - Clients
- `services` - Services proposés
- `subscriptions` - Abonnements clients aux services
- `agents` - Agents/commerciaux
- `statuses` - Statuts des abonnements
- `token_blacklist` - Tokens révoqués

## 🧪 Tests

À venir...

## 📝 Notes

- Les UUID sont générés automatiquement par PostgreSQL (extension uuid-ossp)
- Les timestamps `created_at` et `updated_at` sont gérés automatiquement
- Les relations utilisent `ON DELETE CASCADE` ou `ON DELETE SET NULL` selon le cas
