const cdController = require('../../Controllers/cdController');
const pool = require('../../configs/db');

// Mock du module db
jest.mock('../../configs/db');

describe('CD Controller - Tests Unitaires', () => {
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    jest.clearAllMocks();
    
    // Mock de la requête
    mockRequest = {
      body: {},
      params: {}
    };
    
    // Mock de la réponse
    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
  });

  describe('getAllCDs', () => {
    it('devrait retourner tous les CDs avec succès', async () => {
      // Arrange
      const mockCDs = [
        { id: 1, title: 'Abbey Road', artist: 'The Beatles', year: 1969 },
        { id: 2, title: 'Thriller', artist: 'Michael Jackson', year: 1982 }
      ];
      pool.query.mockResolvedValue({ rows: mockCDs });

      // Act
      await cdController.getAllCDs(mockRequest, mockResponse);

      // Assert
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM cds ORDER BY id ASC');
      expect(mockResponse.json).toHaveBeenCalledWith(mockCDs);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('devrait retourner un tableau vide si aucun CD', async () => {
      // Arrange
      pool.query.mockResolvedValue({ rows: [] });

      // Act
      await cdController.getAllCDs(mockRequest, mockResponse);

      // Assert
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM cds ORDER BY id ASC');
      expect(mockResponse.json).toHaveBeenCalledWith([]);
    });

    it('devrait gérer les erreurs de base de données', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      pool.query.mockRejectedValue(mockError);

      // Act
      await cdController.getAllCDs(mockRequest, mockResponse);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: mockError.message });
    });
  });

  describe('addCD', () => {
    it('devrait ajouter un nouveau CD avec succès', async () => {
      // Arrange
      const newCD = { title: 'Dark Side of the Moon', artist: 'Pink Floyd', year: 1973 };
      const createdCD = { id: 1, ...newCD };
      mockRequest.body = newCD;
      pool.query.mockResolvedValue({ rows: [createdCD] });

      // Act
      await cdController.addCD(mockRequest, mockResponse);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO cds (title, artist, year) VALUES ($1, $2, $3) RETURNING *',
        [newCD.title, newCD.artist, newCD.year]
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(createdCD);
    });

    it('devrait gérer les données manquantes', async () => {
      // Arrange
      mockRequest.body = { title: 'Test Album' }; // artist et year manquants
      const mockError = new Error('null value in column "artist" violates not-null constraint');
      pool.query.mockRejectedValue(mockError);

      // Act
      await cdController.addCD(mockRequest, mockResponse);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: mockError.message });
    });

    it('devrait gérer les erreurs de base de données lors de l\'ajout', async () => {
      // Arrange
      mockRequest.body = { title: 'Test', artist: 'Artist', year: 2020 };
      const mockError = new Error('Database error');
      pool.query.mockRejectedValue(mockError);

      // Act
      await cdController.addCD(mockRequest, mockResponse);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: mockError.message });
    });
  });

  describe('deleteCD', () => {
    it('devrait supprimer un CD avec succès', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      pool.query.mockResolvedValue({ rowCount: 1 });

      // Act
      await cdController.deleteCD(mockRequest, mockResponse);

      // Assert
      expect(pool.query).toHaveBeenCalledWith('DELETE FROM cds WHERE id = $1', ['1']);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('devrait gérer la suppression d\'un CD inexistant', async () => {
      // Arrange
      mockRequest.params = { id: '999' };
      pool.query.mockResolvedValue({ rowCount: 0 });

      // Act
      await cdController.deleteCD(mockRequest, mockResponse);

      // Assert
      expect(pool.query).toHaveBeenCalledWith('DELETE FROM cds WHERE id = $1', ['999']);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
    });

    it('devrait gérer les erreurs lors de la suppression', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      const mockError = new Error('Database error');
      pool.query.mockRejectedValue(mockError);

      // Act
      await cdController.deleteCD(mockRequest, mockResponse);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: mockError.message });
    });

    it('devrait gérer les IDs invalides', async () => {
      // Arrange
      mockRequest.params = { id: 'invalid' };
      const mockError = new Error('invalid input syntax for type integer');
      pool.query.mockRejectedValue(mockError);

      // Act
      await cdController.deleteCD(mockRequest, mockResponse);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: mockError.message });
    });
  });
});
