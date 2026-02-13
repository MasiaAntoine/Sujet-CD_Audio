# Tests E2E avec Cypress

## Méthode 1 : Avec Docker (Recommandé) ✅

Cette méthode lance tout l'environnement automatiquement :

```bash
npm run test:e2e:docker
```

Ce script :
- Lance `docker-compose.prod.yml` (PostgreSQL + Backend + Frontend)
- Attend que les services soient prêts
- Lance les tests Cypress sur le port 3000

## Méthode 2 : Mode manuel

### Prérequis

Avant de lancer les tests E2E, assurez-vous que :
1. La base de données PostgreSQL est lancée
2. Le serveur backend est lancé sur le port 5005
3. Le client frontend est lancé sur le port 5173 (Vite)

### Lancer l'environnement

```bash
# Terminal 1 - Base de données
docker compose -f docker-compose.dev.yml up -d

# Terminal 2 - Backend
cd server
npm run dev

# Terminal 3 - Frontend
cd client
npm run dev
```

### Lancer les tests E2E

#### Mode headless (CI/CD)
```bash
npm run test:e2e
```

#### Mode interactif (développement)
```bash
npm run test:e2e:open
```

## Tests implémentés

1. **Affichage de la page d'accueil**
2. **Ajout d'un nouveau CD**
3. **Affichage des CD disponibles**
4. **Suppression d'un CD**
5. **Cycle complet : ajouter, afficher, supprimer**
6. **Ajout de plusieurs CDs**
7. **Validation des champs requis**
8. **Réinitialisation du formulaire après ajout**

Total : **8 tests E2E**
