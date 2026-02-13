const request = require('supertest');
const express = require('express');
const cdRoutes = require('../../Routes/cdRoutes');
const cdController = require('../../Controllers/cdController');

// Mock du controller
jest.mock('../../Controllers/cdController');

describe('CD Routes - Tests Unitaires', () => {
  let app;

  beforeEach(() => {
    // Créer une nouvelle instance d'Express pour chaque test
    app = express();
    app.use(express.json());
    app.use('/api', cdRoutes);
    
    // Réinitialiser les mocks
    jest.clearAllMocks();
  });

  describe('GET /api/cds', () => {
    it('devrait appeler getAllCDs du controller', async () => {
      // Arrange
      cdController.getAllCDs.mockImplementation((req, res) => {
        res.json([]);
      });

      // Act
      const response = await request(app).get('/api/cds');

      // Assert
      expect(cdController.getAllCDs).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(200);
    });

    it('devrait retourner un tableau de CDs', async () => {
      // Arrange
      const mockCDs = [
        { id: 1, title: 'Test Album', artist: 'Test Artist', year: 2020 }
      ];
      cdController.getAllCDs.mockImplementation((req, res) => {
        res.json(mockCDs);
      });

      // Act
      const response = await request(app).get('/api/cds');

      // Assert
      expect(response.body).toEqual(mockCDs);
      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/cds', () => {
    it('devrait appeler addCD du controller avec les bonnes données', async () => {
      // Arrange
      const newCD = { title: 'New Album', artist: 'New Artist', year: 2023 };
      cdController.addCD.mockImplementation((req, res) => {
        res.status(201).json({ id: 1, ...req.body });
      });

      // Act
      const response = await request(app)
        .post('/api/cds')
        .send(newCD);

      // Assert
      expect(cdController.addCD).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(newCD);
    });

    it('devrait accepter les données JSON', async () => {
      // Arrange
      const newCD = { title: 'Test', artist: 'Artist', year: 2020 };
      cdController.addCD.mockImplementation((req, res) => {
        res.status(201).json({ id: 1, ...req.body });
      });

      // Act
      const response = await request(app)
        .post('/api/cds')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(newCD));

      // Assert
      expect(response.status).toBe(201);
      expect(cdController.addCD).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/cds/:id', () => {
    it('devrait appeler deleteCD du controller avec le bon ID', async () => {
      // Arrange
      cdController.deleteCD.mockImplementation((req, res) => {
        res.status(204).send();
      });

      // Act
      const response = await request(app).delete('/api/cds/1');

      // Assert
      expect(cdController.deleteCD).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(204);
    });

    it('devrait passer l\'ID comme paramètre de route', async () => {
      // Arrange
      let capturedId;
      cdController.deleteCD.mockImplementation((req, res) => {
        capturedId = req.params.id;
        res.status(204).send();
      });

      // Act
      await request(app).delete('/api/cds/42');

      // Assert
      expect(capturedId).toBe('42');
      expect(cdController.deleteCD).toHaveBeenCalled();
    });

    it('devrait gérer les IDs numériques', async () => {
      // Arrange
      cdController.deleteCD.mockImplementation((req, res) => {
        res.status(204).send();
      });

      // Act
      const response = await request(app).delete('/api/cds/123');

      // Assert
      expect(response.status).toBe(204);
      expect(cdController.deleteCD).toHaveBeenCalled();
    });
  });

  describe('Routes invalides', () => {
    it('devrait retourner 404 pour une route inexistante', async () => {
      // Act
      const response = await request(app).get('/api/invalid-route');

      // Assert
      expect(response.status).toBe(404);
    });

    it('devrait retourner 404 pour PUT /api/cds (non implémenté)', async () => {
      // Act
      const response = await request(app)
        .put('/api/cds/1')
        .send({ title: 'Updated' });

      // Assert
      expect(response.status).toBe(404);
    });

    it('devrait retourner 404 pour PATCH /api/cds (non implémenté)', async () => {
      // Act
      const response = await request(app)
        .patch('/api/cds/1')
        .send({ title: 'Updated' });

      // Assert
      expect(response.status).toBe(404);
    });
  });
});
