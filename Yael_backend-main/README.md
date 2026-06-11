# Yael_backend


# 1. Bascule sur la branche dev
git checkout dev

# 2. Récupère d’éventuelles mises à jour distantes
git pull origin dev

# 3. Vérifie l’état des fichiers modifiés
git status

# 4. Ajoute tes modifications
git add .

# 5. Fais ton commit
git commit -m "Ton message décrivant les changements"

# 6. Pousse sur dev
git push origin dev


# 7. render database postgresql 16
-hostname:'dpg-d22vcdemcj7s73d15gug-a'
-port:'5432'
-database:'yael_backend_db'
-username:'yael_backend_db_user'
-password:'CC58BgcuW0QDtjdlbZORFG9UL7COlWvx'
-interne database url:'postgresql://yael_backend_db_user:CC58BgcuW0QDtjdlbZORFG9UL7COlWvx@dpg-d22vcdemcj7s73d15gug-a/yael_backend_db'
-externe databseurl:'postgresql://yael_backend_db_user:CC58BgcuW0QDtjdlbZORFG9UL7COlWvx@dpg-d22vcdemcj7s73d15gug-a.oregon-postgres.render.com/yael_backend_db'
-psql command:'PGPASSWORD=CC58BgcuW0QDtjdlbZORFG9UL7COlWvx psql -h dpg-d22vcdemcj7s73d15gug-a.oregon-postgres.render.com -U yael_backend_db_user yael_backend_db'
JWT_SECRET:'zerT3yX!TaSuperCleSecrete$2025!9qPmR2uF'

# 8. sql
CREATE TABLE villes (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE gares (
  id SERIAL PRIMARY KEY,
  ville_id INTEGER NOT NULL
    REFERENCES villes(id)
    ON DELETE CASCADE,
  nom VARCHAR(150) NOT NULL,
  numero VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(200) NOT NULL
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(200) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE agents (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  numero VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(200) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bus (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100)    NOT NULL,
  matricule VARCHAR(50) UNIQUE NOT NULL,
  capacite INTEGER    NOT NULL,
  statut VARCHAR(50)  NOT NULL
    CHECK (statut IN ('service', 'hors service')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chauffeurs (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100)    NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  telephone VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE horaires (
  id SERIAL PRIMARY KEY,
  heure TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE destinations (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(150) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE trajets (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(150)        NOT NULL,
  depart_gare_id INTEGER   NOT NULL REFERENCES gares(id)        ON DELETE RESTRICT,
  destination_id INTEGER   NOT NULL REFERENCES destinations(id) ON DELETE RESTRICT,
  duree INTERVAL          NOT NULL,
  horaire_id INTEGER       NOT NULL REFERENCES horaires(id)    ON DELETE RESTRICT,
  date DATE               NOT NULL,
  prix NUMERIC(10,2)      NOT NULL,
  created_at TIMESTAMPTZ   DEFAULT NOW()
);

CREATE TABLE voyages (
  id SERIAL PRIMARY KEY,
  trajet_id INTEGER NOT NULL
    REFERENCES trajets(id)
    ON DELETE RESTRICT,
  bus_id INTEGER NOT NULL
    REFERENCES bus(id)
    ON DELETE RESTRICT,
  chauffeur_id INTEGER NOT NULL
    REFERENCES chauffeurs(id)
    ON DELETE RESTRICT,
  statut VARCHAR(20) NOT NULL
    CHECK (statut IN ('attente','depart','arriver')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE passagers (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100)       NOT NULL,
  prenom VARCHAR(100)    NOT NULL,
  telephone VARCHAR(50)  NOT NULL,
  numerocnib VARCHAR(50) NOT NULL,
  date_etablissement DATE NOT NULL,
  date_expiration DATE    NOT NULL,
  trajet_id INTEGER       NOT NULL
    REFERENCES trajets(id)
    ON DELETE RESTRICT,
  codeqr TEXT            NOT NULL,
  created_at TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE reservations (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100)      NOT NULL,
  prenom VARCHAR(100)   NOT NULL,
  telephone VARCHAR(50) NOT NULL,
  trajet_id INTEGER      NOT NULL
    REFERENCES trajets(id)
    ON DELETE RESTRICT,
  actif BOOLEAN         DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE agents ADD COLUMN gare_id INTEGER REFERENCES gares(id) ON DELETE CASCADE;
ALTER TABLE bus ADD COLUMN gare_id INTEGER REFERENCES gares(id) ON DELETE CASCADE;
ALTER TABLE chauffeurs ADD COLUMN gare_id INTEGER REFERENCES gares(id) ON DELETE CASCADE;
ALTER TABLE destinations ADD COLUMN gare_id INTEGER REFERENCES gares(id) ON DELETE CASCADE;
ALTER TABLE horaires ADD COLUMN gare_id INTEGER REFERENCES gares(id) ON DELETE CASCADE;
ALTER TABLE trajets ADD COLUMN gare_id INTEGER REFERENCES gares(id) ON DELETE CASCADE;
ALTER TABLE voyages ADD COLUMN gare_id INTEGER REFERENCES gares(id) ON DELETE CASCADE;
ALTER TABLE passagers ADD COLUMN gare_id INTEGER REFERENCES gares(id) ON DELETE CASCADE;
ALTER TABLE reservations ADD COLUMN gare_id INTEGER REFERENCES gares(id) ON DELETE CASCADE;

set PGPASSWORD=CC58BgcuW0QDtjdlbZORFG9UL7COlWvx
psql -h dpg-d22vcdemcj7s73d15gug-a.oregon-postgres.render.com -U yael_backend_db_user yael_backend_db


# 9. merge
git fetch origin
git checkout main
git pull origin main
git merge dev
git push origin main


git push origin dev:main


# 10. render password
netnetflixs3000@gmail.com
NQvh5g8RH8_gN_W