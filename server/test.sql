-- Connexion à la base
\c client_flow;

-- Extension UUID si pas encore activée
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Insertion des super administrateurs
INSERT INTO users (
    id,
    name,
    email,
    password,
    role,
    created_at,
    updated_at
)
VALUES
(
    uuid_generate_v4(),
    'Samuel SOGLOHOUN',
    'soglohounsamuel2@gmail.com',
    '$2b$10$EfQWRoam1v99K9ytzAhbR.9X4haaxVK.poMkcbc9uK5KFB4/7k41S',
    'super_admin',
    NOW(),
    NOW()
),
(
    uuid_generate_v4(),
    'Yoann ADIGBONON',
    'yoannyamd@gmail.com',
    '$2b$10$8aaVbc4S4AYCGwaLqT898.EaE5doLgqmfV8HKvkH0aicpr622LHqO',
    'super_admin',
    NOW(),
    NOW()
);
