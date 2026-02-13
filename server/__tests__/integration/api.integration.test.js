const request = require('supertest');
const express = require('express');

// Mock du pool
jest.mock('../../configs/db', () => ({
  query: jest.fn(),
}));

const cdRoutes = require('../../Routes/cdRoutes');
const pool = require('../../configs/db');

// Configuration de l'app pour les tests
const app = express();
app.use(express.json());
app.use('/api', cdRoutes);

describe('Tests d\'Intégration - API + Routes + Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/cds', () => {
    it('devrait retourner tous les CDs', async () => {
      const mockCDs = [
        { id: 1, title: 'Test Album', artist: 'Test Artist', year: 2020 }
      ];
      pool.query.mockResolvedValue({ rows: mockCDs });

      const response = await request(app).get('/api/cds');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCDs);
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM cds ORDER BY id ASC');
    });

    it('devrait retourner un tableau vide si aucun CD', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const response = await request(app).get('/api/cds');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('devrait retourner plusieurs CDs triés par ID', async () => {
      const mockCDs = [
        { id: 1, title: 'Album 1', artist: 'Artist 1', year: 2020 },
        { id: 2, title: 'Album 2', artist: 'Artist 2', year: 2021 },
        { id: 3, title: 'Album 3', artist: 'Artist 3', year: 2022 }
      ];
      pool.query.mockResolvedValue({ rows: mockCDs });

      const response = await request(app).get('/api/cds');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(3);
      expect(response.body[0].id).toBe(1);
    });

    it('devrait gérer les erreurs de base de données', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/cds');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });

    it('devrait retourner le bon format JSON', async () => {
      const mockCDs = [{ id: 1, title: 'Test', artist: 'Artist', year: 2020 }];
      pool.query.mockResolvedValue({ rows: mockCDs });

      const response = await request(app).get('/api/cds');

      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/cds', () => {
    it('devrait créer un CD avec toutes les données', async () => {
      const newCD = { title: 'New Album', artist: 'New Artist', year: 2021 };
      const createdCD = { id: 1, ...newCD };
      pool.query.mockResolvedValue({ rows: [createdCD] });

      const response = await request(app)
        .post('/api/cds')
        .send(newCD);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdCD);
      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO cds (title, artist, year) VALUES ($1, $2, $3) RETURNING *',
        [newCD.title, newCD.artist, newCD.year]
      );
    });

    it('devrait accepter les données JSON', async () => {
      const newCD = { title: 'Test', artist: 'Artist', year: 2020 };
      pool.query.mockResolvedValue({ rows: [{ id: 1, ...newCD }] });

      const response = await request(app)
        .post('/api/cds')
        .set('Content-Type', 'application/json')
        .send(newCD);

      expect(response.status).toBe(201);
    });

    it('devrait retourner le CD créé avec un ID', async () => {
      const newCD = { title: 'Test', artist: 'Artist', year: 2020 };
      const createdCD = { id: 42, ...newCD };
      pool.query.mockResolvedValue({ rows: [createdCD] });

      const response = await request(app)
        .post('/api/cds')
        .send(newCD);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(42);
    });

    it('devrait gérer les erreurs de validation', async () => {
      pool.query.mockRejectedValue(new Error('Validation error'));

      const response = await request(app)
        .post('/api/cds')
        .send({ title: 'Test' });

      expect(response.status).toBe(500);
    });

    it('devrait créer un CD avec une année récente', async () => {
      const newCD = { title: 'Modern Album', artist: 'Modern Artist', year: 2024 };
      pool.query.mockResolvedValue({ rows: [{ id: 1, ...newCD }] });

      const response = await request(app)
        .post('/api/cds')
        .send(newCD);

      expect(response.status).toBe(201);
      expect(response.body.year).toBe(2024);
    });

    it('devrait créer un CD avec une année ancienne', async () => {
      const newCD = { title: 'Old Album', artist: 'Old Artist', year: 1970 };
      pool.query.mockResolvedValue({ rows: [{ id: 1, ...newCD }] });

      const response = await request(app)
        .post('/api/cds')
        .send(newCD);

      expect(response.status).toBe(201);
      expect(response.body.year).toBe(1970);
    });
  });

  describe('DELETE /api/cds/:id', () => {
    it('devrait supprimer un CD existant', async () => {
      pool.query.mockResolvedValue({ rowCount: 1 });

      const response = await request(app).delete('/api/cds/1');

      expect(response.status).toBe(204);
      expect(pool.query).toHaveBeenCalledWith(
        'DELETE FROM cds WHERE id = $1',
        ['1']
      );
    });

    it('devrait accepter des IDs numériques', async () => {
      pool.query.mockResolvedValue({ rowCount: 1 });

      const response = await request(app).delete('/api/cds/123');

      expect(response.status).toBe(204);
      expect(pool.query).toHaveBeenCalledWith(
        'DELETE FROM cds WHERE id = $1',
        ['123']
      );
    });

    it('devrait gérer la suppression d\'un CD inexistant', async () => {
      pool.query.mockResolvedValue({ rowCount: 0 });

      const response = await request(app).delete('/api/cds/999');

      expect(response.status).toBe(204);
    });

    it('devrait gérer les erreurs de base de données', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      const response = await request(app).delete('/api/cds/1');

      expect(response.status).toBe(500);
    });
  });

  describe('Flux complets', () => {
    it('devrait créer puis récupérer un CD', async () => {
      const newCD = { title: 'Flow Test', artist: 'Flow Artist', year: 2023 };
      const createdCD = { id: 1, ...newCD };
      
      // Mock pour la création
      pool.query.mockResolvedValueOnce({ rows: [createdCD] });
      
      // Créer le CD
      const createResponse = await request(app)
        .post('/api/cds')
        .send(newCD);
      
      expect(createResponse.status).toBe(201);
      
      // Mock pour la récupération
      pool.query.mockResolvedValueOnce({ rows: [createdCD] });
      
      // Récupérer les CDs
      const getResponse = await request(app).get('/api/cds');
      
      expect(getResponse.status).toBe(200);
      expect(getResponse.body).toContainEqual(createdCD);
    });

    it('devrait créer puis supprimer un CD', async () => {
      const newCD = { title: 'Delete Test', artist: 'Delete Artist', year: 2023 };
      const createdCD = { id: 1, ...newCD };
      
      // Créer
      pool.query.mockResolvedValueOnce({ rows: [createdCD] });
      const createResponse = await request(app)
        .post('/api/cds')
        .send(newCD);
      
      expect(createResponse.status).toBe(201);
      const cdId = createResponse.body.id;
      
      // Supprimer
      pool.query.mockResolvedValueOnce({ rowCount: 1 });
      const deleteResponse = await request(app).delete(`/api/cds/${cdId}`);
      
      expect(deleteResponse.status).toBe(204);
    });

    it('devrait gérer plusieurs opérations successives', async () => {
      // Créer CD 1
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1, title: 'CD 1', artist: 'A1', year: 2020 }] });
      await request(app).post('/api/cds').send({ title: 'CD 1', artist: 'A1', year: 2020 });
      
      // Créer CD 2
      pool.query.mockResolvedValueOnce({ rows: [{ id: 2, title: 'CD 2', artist: 'A2', year: 2021 }] });
      await request(app).post('/api/cds').send({ title: 'CD 2', artist: 'A2', year: 2021 });
      
      // Récupérer tous
      pool.query.mockResolvedValueOnce({ rows: [
        { id: 1, title: 'CD 1', artist: 'A1', year: 2020 },
        { id: 2, title: 'CD 2', artist: 'A2', year: 2021 }
      ]});
      const getResponse = await request(app).get('/api/cds');
      
      expect(getResponse.body).toHaveLength(2);
    });
  });

  describe('Routes invalides', () => {
    it('devrait retourner 404 pour PUT /api/cds', async () => {
      const response = await request(app)
        .put('/api/cds/1')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
    });

    it('devrait retourner 404 pour PATCH /api/cds', async () => {
      const response = await request(app)
        .patch('/api/cds/1')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
    });
  });
});
