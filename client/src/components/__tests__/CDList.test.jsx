import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CDList from '../CDList';
import * as cdService from '../../services/cdService';

// Mock du service
jest.mock('../../services/cdService');

describe('CDList - Tests de Composant', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cdService.getCDs.mockReset();
    cdService.deleteCD.mockReset();
  });

  describe('Rendu du composant', () => {
    it('devrait afficher le titre "Liste des CD"', async () => {
      // Arrange
      cdService.getCDs.mockResolvedValue([]);

      // Act
      render(<CDList />);

      // Assert
      expect(screen.getByText(/Liste des CD/i)).toBeInTheDocument();
    });

    it('devrait afficher "Aucun CD disponible" quand la liste est vide', async () => {
      // Arrange
      cdService.getCDs.mockResolvedValue([]);

      // Act
      render(<CDList />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/Aucun CD disponible/i)).toBeInTheDocument();
      });
    });

    it('devrait afficher la liste des CDs', async () => {
      // Arrange
      const mockCDs = [
        { id: 1, title: 'Abbey Road', artist: 'The Beatles', year: 1969 },
        { id: 2, title: 'Thriller', artist: 'Michael Jackson', year: 1982 }
      ];
      cdService.getCDs.mockResolvedValue(mockCDs);

      // Act
      render(<CDList />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/Abbey Road/i)).toBeInTheDocument();
        expect(screen.getByText(/Thriller/i)).toBeInTheDocument();
      });
    });

    it('devrait rendre un CDItem pour chaque CD', async () => {
      // Arrange
      const mockCDs = [
        { id: 1, title: 'CD 1', artist: 'Artist 1', year: 2020 },
        { id: 2, title: 'CD 2', artist: 'Artist 2', year: 2021 },
        { id: 3, title: 'CD 3', artist: 'Artist 3', year: 2022 }
      ];
      cdService.getCDs.mockResolvedValue(mockCDs);

      // Act
      render(<CDList />);

      // Assert
      await waitFor(() => {
        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(3);
      });
    });
  });

  describe('Chargement initial', () => {
    it('devrait appeler getCDs au montage du composant', async () => {
      // Arrange
      cdService.getCDs.mockResolvedValue([]);

      // Act
      render(<CDList />);

      // Assert
      await waitFor(() => {
        expect(cdService.getCDs).toHaveBeenCalledTimes(1);
      });
    });

    it('devrait charger les CDs une seule fois au montage', async () => {
      // Arrange
      cdService.getCDs.mockResolvedValue([
        { id: 1, title: 'Test', artist: 'Artist', year: 2020 }
      ]);

      // Act
      render(<CDList />);

      // Assert
      await waitFor(() => {
        expect(cdService.getCDs).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Suppression de CD', () => {
    it('devrait appeler deleteCD quand on clique sur supprimer', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockCDs = [
        { id: 1, title: 'Test CD', artist: 'Test Artist', year: 2020 }
      ];
      cdService.getCDs.mockResolvedValue(mockCDs);
      cdService.deleteCD.mockResolvedValue();

      render(<CDList />);

      await waitFor(() => {
        expect(screen.getByText(/Test CD/i)).toBeInTheDocument();
      });

      // Act
      const deleteButton = screen.getByRole('button', { name: /supprimer/i });
      await user.click(deleteButton);

      // Assert
      await waitFor(() => {
        expect(cdService.deleteCD).toHaveBeenCalledWith(1);
      });
    });

    it('devrait rafraîchir la liste après suppression', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockCDs = [
        { id: 1, title: 'CD to delete', artist: 'Artist', year: 2020 }
      ];
      
      // Premier appel : retourne le CD
      // Deuxième appel : retourne une liste vide (après suppression)
      cdService.getCDs
        .mockResolvedValueOnce(mockCDs)
        .mockResolvedValueOnce([]);
      cdService.deleteCD.mockResolvedValue();

      render(<CDList />);

      await waitFor(() => {
        expect(screen.getByText(/CD to delete/i)).toBeInTheDocument();
      });

      // Act
      const deleteButton = screen.getByRole('button', { name: /supprimer/i });
      await user.click(deleteButton);

      // Assert
      await waitFor(() => {
        expect(cdService.getCDs).toHaveBeenCalledTimes(2);
        expect(screen.getByText(/Aucun CD disponible/i)).toBeInTheDocument();
      });
    });

    it('devrait supprimer le bon CD parmi plusieurs', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockCDs = [
        { id: 1, title: 'CD 1', artist: 'Artist 1', year: 2020 },
        { id: 2, title: 'CD 2', artist: 'Artist 2', year: 2021 },
        { id: 3, title: 'CD 3', artist: 'Artist 3', year: 2022 }
      ];
      cdService.getCDs.mockResolvedValue(mockCDs);
      cdService.deleteCD.mockResolvedValue();

      render(<CDList />);

      await waitFor(() => {
        expect(screen.getByText(/CD 2/i)).toBeInTheDocument();
      });

      // Act - Supprimer le CD 2
      const cd2Element = screen.getByText(/CD 2 - Artist 2/i).closest('li');
      const deleteButton = within(cd2Element).getByRole('button');
      await user.click(deleteButton);

      // Assert
      await waitFor(() => {
        expect(cdService.deleteCD).toHaveBeenCalledWith(2);
      });
    });
  });

  describe('Gestion des erreurs', () => {
    it('devrait gérer les erreurs lors du chargement des CDs', async () => {
      // Arrange
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      cdService.getCDs.mockRejectedValue(new Error('Network error'));

      // Act
      render(<CDList />);

      // Assert
      await waitFor(() => {
        expect(cdService.getCDs).toHaveBeenCalled();
      }, { timeout: 3000 });

      consoleErrorSpy.mockRestore();
    });

    it('devrait gérer les erreurs lors de la suppression', async () => {
      // Arrange
      const user = userEvent.setup();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const mockCDs = [
        { id: 1, title: 'Test', artist: 'Artist', year: 2020 }
      ];
      cdService.getCDs.mockResolvedValue(mockCDs);
      cdService.deleteCD.mockRejectedValue(new Error('Delete failed'));

      render(<CDList />);

      await waitFor(() => {
        expect(screen.getByText(/Test/i)).toBeInTheDocument();
      });

      // Act
      const deleteButton = screen.getByRole('button');
      await user.click(deleteButton);

      // Assert
      await waitFor(() => {
        expect(cdService.deleteCD).toHaveBeenCalled();
      }, { timeout: 3000 });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Structure du composant', () => {
    it('devrait rendre une liste ul', async () => {
      // Arrange
      cdService.getCDs.mockResolvedValue([]);

      // Act
      const { container } = render(<CDList />);

      // Assert
      await waitFor(() => {
        const ul = container.querySelector('ul');
        expect(ul).toBeInTheDocument();
      });
    });

    it('devrait avoir la classe container', async () => {
      // Arrange
      cdService.getCDs.mockResolvedValue([]);

      // Act
      const { container } = render(<CDList />);

      // Assert
      await waitFor(() => {
        const containerDiv = container.querySelector('.container');
        expect(containerDiv).toBeInTheDocument();
      });
    });
  });

  describe('Affichage dynamique', () => {
    it('devrait mettre à jour l\'affichage quand les CDs changent', async () => {
      // Arrange
      const initialCDs = [
        { id: 1, title: 'CD 1', artist: 'Artist 1', year: 2020 }
      ];
      const updatedCDs = [
        { id: 1, title: 'CD 1', artist: 'Artist 1', year: 2020 },
        { id: 2, title: 'CD 2', artist: 'Artist 2', year: 2021 }
      ];

      cdService.getCDs
        .mockResolvedValueOnce(initialCDs)
        .mockResolvedValueOnce(updatedCDs);

      // Act
      const { rerender } = render(<CDList />);

      await waitFor(() => {
        expect(screen.getByText(/CD 1/i)).toBeInTheDocument();
      });

      // Simuler un rechargement
      rerender(<CDList />);

      // Assert
      await waitFor(() => {
        const listItems = screen.getAllByRole('listitem');
        expect(listItems.length).toBeGreaterThan(0);
      });
    });

    it('devrait afficher plusieurs CDs avec des informations différentes', async () => {
      // Arrange
      const mockCDs = [
        { id: 1, title: 'Abbey Road', artist: 'The Beatles', year: 1969 },
        { id: 2, title: 'Thriller', artist: 'Michael Jackson', year: 1982 }
      ];
      cdService.getCDs.mockResolvedValue(mockCDs);

      // Act
      render(<CDList />);

      // Assert - Vérifier que les deux CDs sont affichés
      await waitFor(() => {
        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(2);
      }, { timeout: 3000 });
      
      // Vérifier le contenu
      expect(screen.getByText(/Abbey Road/i)).toBeInTheDocument();
      expect(screen.getByText(/Thriller/i)).toBeInTheDocument();
    });
  });

  describe('Intégration avec CDItem', () => {
    it('devrait passer les bonnes props à CDItem', async () => {
      // Arrange
      const mockCDs = [
        { id: 1, title: 'Test', artist: 'Artist', year: 2020 }
      ];
      cdService.getCDs.mockResolvedValue(mockCDs);

      // Act
      render(<CDList />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/Test - Artist \(2020\)/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /supprimer/i })).toBeInTheDocument();
      });
    });

    it('devrait passer la fonction handleDelete à chaque CDItem', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockCDs = [
        { id: 1, title: 'CD 1', artist: 'Artist 1', year: 2020 },
        { id: 2, title: 'CD 2', artist: 'Artist 2', year: 2021 }
      ];
      cdService.getCDs.mockResolvedValue(mockCDs);
      cdService.deleteCD.mockResolvedValue();

      render(<CDList />);

      await waitFor(() => {
        expect(screen.getAllByRole('button')).toHaveLength(2);
      });

      // Act
      const buttons = screen.getAllByRole('button');
      await user.click(buttons[0]);

      // Assert
      await waitFor(() => {
        expect(cdService.deleteCD).toHaveBeenCalledWith(1);
      });
    });
  });
});
