import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddCD from '../AddCD';
import * as cdService from '../../services/cdService';

// Mock du service
jest.mock('../../services/cdService');

describe('AddCD - Tests de Composant', () => {
  const mockOnAdd = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendu du composant', () => {
    it('devrait afficher le titre "Ajouter un CD"', () => {
      // Act
      render(<AddCD onAdd={mockOnAdd} />);

      // Assert
      expect(screen.getByText(/Ajouter un CD/i)).toBeInTheDocument();
    });

    it('devrait afficher un formulaire avec 3 champs', () => {
      // Act
      render(<AddCD onAdd={mockOnAdd} />);

      // Assert
      expect(screen.getByPlaceholderText(/Titre du CD/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Artiste/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Année/i)).toBeInTheDocument();
    });

    it('devrait afficher un bouton "Ajouter"', () => {
      // Act
      render(<AddCD onAdd={mockOnAdd} />);

      // Assert
      const button = screen.getByRole('button', { name: /Ajouter/i });
      expect(button).toBeInTheDocument();
    });

    it('devrait avoir des champs vides au départ', () => {
      // Act
      render(<AddCD onAdd={mockOnAdd} />);

      // Assert
      expect(screen.getByPlaceholderText(/Titre du CD/i)).toHaveValue('');
      expect(screen.getByPlaceholderText(/Artiste/i)).toHaveValue('');
      expect(screen.getByPlaceholderText(/Année/i)).toHaveValue(null);
    });

    it('devrait avoir les attributs required sur tous les champs', () => {
      // Act
      render(<AddCD onAdd={mockOnAdd} />);

      // Assert
      expect(screen.getByPlaceholderText(/Titre du CD/i)).toBeRequired();
      expect(screen.getByPlaceholderText(/Artiste/i)).toBeRequired();
      expect(screen.getByPlaceholderText(/Année/i)).toBeRequired();
    });
  });

  describe('Interactions utilisateur', () => {
    it('devrait permettre de saisir le titre', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<AddCD onAdd={mockOnAdd} />);
      const titleInput = screen.getByPlaceholderText(/Titre du CD/i);

      // Act
      await user.type(titleInput, 'Abbey Road');

      // Assert
      expect(titleInput).toHaveValue('Abbey Road');
    });

    it('devrait permettre de saisir l\'artiste', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<AddCD onAdd={mockOnAdd} />);
      const artistInput = screen.getByPlaceholderText(/Artiste/i);

      // Act
      await user.type(artistInput, 'The Beatles');

      // Assert
      expect(artistInput).toHaveValue('The Beatles');
    });

    it('devrait permettre de saisir l\'année', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<AddCD onAdd={mockOnAdd} />);
      const yearInput = screen.getByPlaceholderText(/Année/i);

      // Act
      await user.type(yearInput, '1969');

      // Assert
      expect(yearInput).toHaveValue(1969);
    });

    it('devrait mettre à jour tous les champs indépendamment', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<AddCD onAdd={mockOnAdd} />);

      // Act
      await user.type(screen.getByPlaceholderText(/Titre du CD/i), 'Dark Side');
      await user.type(screen.getByPlaceholderText(/Artiste/i), 'Pink Floyd');
      await user.type(screen.getByPlaceholderText(/Année/i), '1973');

      // Assert
      expect(screen.getByPlaceholderText(/Titre du CD/i)).toHaveValue('Dark Side');
      expect(screen.getByPlaceholderText(/Artiste/i)).toHaveValue('Pink Floyd');
      expect(screen.getByPlaceholderText(/Année/i)).toHaveValue(1973);
    });
  });

  describe('Soumission du formulaire', () => {
    it('devrait appeler addCD et onAdd lors de la soumission', async () => {
      // Arrange
      const user = userEvent.setup();
      cdService.addCD.mockResolvedValue({ id: 1, title: 'Test', artist: 'Artist', year: 2020 });
      render(<AddCD onAdd={mockOnAdd} />);

      // Act
      await user.type(screen.getByPlaceholderText(/Titre du CD/i), 'Test Album');
      await user.type(screen.getByPlaceholderText(/Artiste/i), 'Test Artist');
      await user.type(screen.getByPlaceholderText(/Année/i), '2020');
      await user.click(screen.getByRole('button', { name: /Ajouter/i }));

      // Assert
      await waitFor(() => {
        expect(cdService.addCD).toHaveBeenCalledWith({
          title: 'Test Album',
          artist: 'Test Artist',
          year: '2020'
        });
        expect(mockOnAdd).toHaveBeenCalledTimes(1);
      });
    });

    it('devrait réinitialiser le formulaire après soumission', async () => {
      // Arrange
      const user = userEvent.setup();
      cdService.addCD.mockResolvedValue({ id: 1 });
      render(<AddCD onAdd={mockOnAdd} />);

      // Act
      await user.type(screen.getByPlaceholderText(/Titre du CD/i), 'Test');
      await user.type(screen.getByPlaceholderText(/Artiste/i), 'Artist');
      await user.type(screen.getByPlaceholderText(/Année/i), '2020');
      await user.click(screen.getByRole('button', { name: /Ajouter/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Titre du CD/i)).toHaveValue('');
        expect(screen.getByPlaceholderText(/Artiste/i)).toHaveValue('');
        expect(screen.getByPlaceholderText(/Année/i)).toHaveValue(null);
      });
    });

    it('ne devrait pas soumettre si les champs sont vides', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<AddCD onAdd={mockOnAdd} />);

      // Act
      await user.click(screen.getByRole('button', { name: /Ajouter/i }));

      // Assert
      expect(cdService.addCD).not.toHaveBeenCalled();
      expect(mockOnAdd).not.toHaveBeenCalled();
    });

    it('ne devrait pas soumettre si le titre est manquant', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<AddCD onAdd={mockOnAdd} />);

      // Act
      await user.type(screen.getByPlaceholderText(/Artiste/i), 'Artist');
      await user.type(screen.getByPlaceholderText(/Année/i), '2020');
      await user.click(screen.getByRole('button', { name: /Ajouter/i }));

      // Assert
      expect(cdService.addCD).not.toHaveBeenCalled();
    });

    it('ne devrait pas soumettre si l\'artiste est manquant', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<AddCD onAdd={mockOnAdd} />);

      // Act
      await user.type(screen.getByPlaceholderText(/Titre du CD/i), 'Title');
      await user.type(screen.getByPlaceholderText(/Année/i), '2020');
      await user.click(screen.getByRole('button', { name: /Ajouter/i }));

      // Assert
      expect(cdService.addCD).not.toHaveBeenCalled();
    });

    it('ne devrait pas soumettre si l\'année est manquante', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<AddCD onAdd={mockOnAdd} />);

      // Act
      await user.type(screen.getByPlaceholderText(/Titre du CD/i), 'Title');
      await user.type(screen.getByPlaceholderText(/Artiste/i), 'Artist');
      await user.click(screen.getByRole('button', { name: /Ajouter/i }));

      // Assert
      expect(cdService.addCD).not.toHaveBeenCalled();
    });

    it('devrait empêcher le comportement par défaut du formulaire', async () => {
      // Arrange
      const user = userEvent.setup();
      cdService.addCD.mockResolvedValue({ id: 1 });
      render(<AddCD onAdd={mockOnAdd} />);

      // Act
      await user.type(screen.getByPlaceholderText(/Titre du CD/i), 'Test');
      await user.type(screen.getByPlaceholderText(/Artiste/i), 'Artist');
      await user.type(screen.getByPlaceholderText(/Année/i), '2020');
      
      const form = screen.getByRole('button').closest('form');
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      const preventDefault = jest.fn();
      submitEvent.preventDefault = preventDefault;
      
      fireEvent(form, submitEvent);

      // Assert
      expect(preventDefault).toHaveBeenCalled();
    });
  });

  describe('Gestion des erreurs', () => {
    it('devrait gérer les erreurs du service addCD', async () => {
      // Arrange
      const user = userEvent.setup();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      cdService.addCD.mockRejectedValue(new Error('Network error'));
      render(<AddCD onAdd={mockOnAdd} />);

      // Act
      await user.type(screen.getByPlaceholderText(/Titre du CD/i), 'Test');
      await user.type(screen.getByPlaceholderText(/Artiste/i), 'Artist');
      await user.type(screen.getByPlaceholderText(/Année/i), '2020');
      
      // Attendre que l'erreur soit gérée
      await user.click(screen.getByRole('button', { name: /Ajouter/i }));

      // Assert
      await waitFor(() => {
        expect(cdService.addCD).toHaveBeenCalled();
      }, { timeout: 3000 });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Types de champs', () => {
    it('devrait avoir un champ de type text pour le titre', () => {
      // Act
      render(<AddCD onAdd={mockOnAdd} />);

      // Assert
      expect(screen.getByPlaceholderText(/Titre du CD/i)).toHaveAttribute('type', 'text');
    });

    it('devrait avoir un champ de type text pour l\'artiste', () => {
      // Act
      render(<AddCD onAdd={mockOnAdd} />);

      // Assert
      expect(screen.getByPlaceholderText(/Artiste/i)).toHaveAttribute('type', 'text');
    });

    it('devrait avoir un champ de type number pour l\'année', () => {
      // Act
      render(<AddCD onAdd={mockOnAdd} />);

      // Assert
      expect(screen.getByPlaceholderText(/Année/i)).toHaveAttribute('type', 'number');
    });
  });
});
