import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getCDs, addCD, deleteCD } from '../cdService';

describe('cdService - Tests Unitaires', () => {
  let mock;
  const API_URL = 'http://localhost:5005/api/cds';

  beforeEach(() => {
    // Créer un mock d'axios
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    // Restaurer axios après chaque test
    mock.restore();
  });

  describe('getCDs', () => {
    it('devrait récupérer tous les CDs avec succès', async () => {
      // Arrange
      const mockCDs = [
        { id: 1, title: 'Abbey Road', artist: 'The Beatles', year: 1969 },
        { id: 2, title: 'Thriller', artist: 'Michael Jackson', year: 1982 }
      ];
      mock.onGet(API_URL).reply(200, mockCDs);

      // Act
      const result = await getCDs();

      // Assert
      expect(result).toEqual(mockCDs);
      expect(result).toHaveLength(2);
    });

    it('devrait retourner un tableau vide si aucun CD', async () => {
      // Arrange
      mock.onGet(API_URL).reply(200, []);

      // Act
      const result = await getCDs();

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('devrait gérer les erreurs réseau', async () => {
      // Arrange
      mock.onGet(API_URL).networkError();

      // Act & Assert
      await expect(getCDs()).rejects.toThrow('Network Error');
    });

    it('devrait gérer les erreurs serveur (500)', async () => {
      // Arrange
      mock.onGet(API_URL).reply(500, { error: 'Internal Server Error' });

      // Act & Assert
      await expect(getCDs()).rejects.toThrow();
    });

    it('devrait gérer les erreurs 404', async () => {
      // Arrange
      mock.onGet(API_URL).reply(404);

      // Act & Assert
      await expect(getCDs()).rejects.toThrow();
    });
  });

  describe('addCD', () => {
    it('devrait ajouter un nouveau CD avec succès', async () => {
      // Arrange
      const newCD = { title: 'Dark Side of the Moon', artist: 'Pink Floyd', year: 1973 };
      const createdCD = { id: 1, ...newCD };
      mock.onPost(API_URL, newCD).reply(201, createdCD);

      // Act
      const result = await addCD(newCD);

      // Assert
      expect(result).toEqual(createdCD);
      expect(result.id).toBeDefined();
      expect(result.title).toBe(newCD.title);
    });

    it('devrait envoyer les données au bon format', async () => {
      // Arrange
      const newCD = { title: 'Test Album', artist: 'Test Artist', year: 2020 };
      const createdCD = { id: 1, ...newCD };
      
      mock.onPost(API_URL).reply((config) => {
        const data = JSON.parse(config.data);
        expect(data).toEqual(newCD);
        return [201, createdCD];
      });

      // Act
      await addCD(newCD);

      // Assert - vérifié dans le mock
    });

    it('devrait gérer les erreurs de validation (400)', async () => {
      // Arrange
      const invalidCD = { title: 'Test' }; // artist et year manquants
      mock.onPost(API_URL).reply(400, { error: 'Validation error' });

      // Act & Assert
      await expect(addCD(invalidCD)).rejects.toThrow();
    });

    it('devrait gérer les erreurs serveur lors de l\'ajout', async () => {
      // Arrange
      const newCD = { title: 'Test', artist: 'Artist', year: 2020 };
      mock.onPost(API_URL).reply(500, { error: 'Database error' });

      // Act & Assert
      await expect(addCD(newCD)).rejects.toThrow();
    });

    it('devrait gérer les erreurs réseau lors de l\'ajout', async () => {
      // Arrange
      const newCD = { title: 'Test', artist: 'Artist', year: 2020 };
      mock.onPost(API_URL).networkError();

      // Act & Assert
      await expect(addCD(newCD)).rejects.toThrow('Network Error');
    });
  });

  describe('deleteCD', () => {
    it('devrait supprimer un CD avec succès', async () => {
      // Arrange
      const cdId = 1;
      mock.onDelete(`${API_URL}/${cdId}`).reply(204);

      // Act
      await deleteCD(cdId);

      // Assert
      expect(mock.history.delete.length).toBe(1);
      expect(mock.history.delete[0].url).toBe(`${API_URL}/${cdId}`);
    });

    it('devrait appeler la bonne URL avec l\'ID', async () => {
      // Arrange
      const cdId = 42;
      mock.onDelete(`${API_URL}/${cdId}`).reply(204);

      // Act
      await deleteCD(cdId);

      // Assert
      expect(mock.history.delete[0].url).toContain('/42');
    });

    it('devrait gérer la suppression d\'un CD inexistant (404)', async () => {
      // Arrange
      const cdId = 999;
      mock.onDelete(`${API_URL}/${cdId}`).reply(404, { error: 'CD not found' });

      // Act & Assert
      await expect(deleteCD(cdId)).rejects.toThrow();
    });

    it('devrait gérer les erreurs serveur lors de la suppression', async () => {
      // Arrange
      const cdId = 1;
      mock.onDelete(`${API_URL}/${cdId}`).reply(500, { error: 'Database error' });

      // Act & Assert
      await expect(deleteCD(cdId)).rejects.toThrow();
    });

    it('devrait gérer les erreurs réseau lors de la suppression', async () => {
      // Arrange
      const cdId = 1;
      mock.onDelete(`${API_URL}/${cdId}`).networkError();

      // Act & Assert
      await expect(deleteCD(cdId)).rejects.toThrow('Network Error');
    });

    it('devrait gérer les IDs invalides', async () => {
      // Arrange
      const invalidId = 'invalid';
      mock.onDelete(`${API_URL}/${invalidId}`).reply(400, { error: 'Invalid ID' });

      // Act & Assert
      await expect(deleteCD(invalidId)).rejects.toThrow();
    });
  });

  describe('Tests d\'intégration du service', () => {
    it('devrait gérer une séquence complète : ajouter puis récupérer', async () => {
      // Arrange
      const newCD = { title: 'Test Album', artist: 'Test Artist', year: 2020 };
      const createdCD = { id: 1, ...newCD };
      
      mock.onPost(API_URL).reply(201, createdCD);
      mock.onGet(API_URL).reply(200, [createdCD]);

      // Act
      const added = await addCD(newCD);
      const allCDs = await getCDs();

      // Assert
      expect(added).toEqual(createdCD);
      expect(allCDs).toContainEqual(createdCD);
    });

    it('devrait gérer une séquence : ajouter, récupérer, supprimer', async () => {
      // Arrange
      const newCD = { title: 'Test Album', artist: 'Test Artist', year: 2020 };
      const createdCD = { id: 1, ...newCD };
      
      mock.onPost(API_URL).reply(201, createdCD);
      mock.onGet(API_URL).reply(200, [createdCD]);
      mock.onDelete(`${API_URL}/1`).reply(204);

      // Act
      await addCD(newCD);
      const cdsBeforeDelete = await getCDs();
      await deleteCD(1);

      // Assert
      expect(cdsBeforeDelete).toHaveLength(1);
      expect(mock.history.delete.length).toBe(1);
    });
  });
});
