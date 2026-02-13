import { render, screen, fireEvent } from '@testing-library/react';
import CDItem from '../CDItem';

describe('CDItem - Tests de Composant', () => {
  const mockCD = {
    id: 1,
    title: 'Abbey Road',
    artist: 'The Beatles',
    year: 1969
  };

  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendu du composant', () => {
    it('devrait afficher les informations du CD', () => {
      // Act
      render(<CDItem cd={mockCD} onDelete={mockOnDelete} />);

      // Assert
      expect(screen.getByText(/Abbey Road/i)).toBeInTheDocument();
      expect(screen.getByText(/The Beatles/i)).toBeInTheDocument();
      expect(screen.getByText(/1969/i)).toBeInTheDocument();
    });

    it('devrait afficher le titre, l\'artiste et l\'année dans le bon format', () => {
      // Act
      render(<CDItem cd={mockCD} onDelete={mockOnDelete} />);

      // Assert
      const text = screen.getByText(/Abbey Road - The Beatles \(1969\)/i);
      expect(text).toBeInTheDocument();
    });

    it('devrait afficher un bouton de suppression', () => {
      // Act
      render(<CDItem cd={mockCD} onDelete={mockOnDelete} />);

      // Assert
      const deleteButton = screen.getByRole('button', { name: /supprimer/i });
      expect(deleteButton).toBeInTheDocument();
    });

    it('devrait avoir la classe CSS appropriée pour le bouton', () => {
      // Act
      render(<CDItem cd={mockCD} onDelete={mockOnDelete} />);

      // Assert
      const deleteButton = screen.getByRole('button');
      expect(deleteButton).toHaveClass('delete-btn');
    });
  });

  describe('Interactions utilisateur', () => {
    it('devrait appeler onDelete avec le bon ID quand on clique sur supprimer', () => {
      // Arrange
      render(<CDItem cd={mockCD} onDelete={mockOnDelete} />);
      const deleteButton = screen.getByRole('button');

      // Act
      fireEvent.click(deleteButton);

      // Assert
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
      expect(mockOnDelete).toHaveBeenCalledWith(mockCD.id);
    });

    it('ne devrait pas appeler onDelete si le bouton n\'est pas cliqué', () => {
      // Act
      render(<CDItem cd={mockCD} onDelete={mockOnDelete} />);

      // Assert
      expect(mockOnDelete).not.toHaveBeenCalled();
    });

    it('devrait appeler onDelete plusieurs fois si cliqué plusieurs fois', () => {
      // Arrange
      render(<CDItem cd={mockCD} onDelete={mockOnDelete} />);
      const deleteButton = screen.getByRole('button');

      // Act
      fireEvent.click(deleteButton);
      fireEvent.click(deleteButton);
      fireEvent.click(deleteButton);

      // Assert
      expect(mockOnDelete).toHaveBeenCalledTimes(3);
    });
  });

  describe('Cas limites', () => {
    it('devrait gérer un CD avec un titre long', () => {
      // Arrange
      const longTitleCD = {
        ...mockCD,
        title: 'This is a very long album title that should still be displayed correctly'
      };

      // Act
      render(<CDItem cd={longTitleCD} onDelete={mockOnDelete} />);

      // Assert
      expect(screen.getByText(new RegExp(longTitleCD.title))).toBeInTheDocument();
    });

    it('devrait gérer un CD avec un artiste long', () => {
      // Arrange
      const longArtistCD = {
        ...mockCD,
        artist: 'This is a very long artist name with multiple words'
      };

      // Act
      render(<CDItem cd={longArtistCD} onDelete={mockOnDelete} />);

      // Assert
      expect(screen.getByText(new RegExp(longArtistCD.artist))).toBeInTheDocument();
    });

    it('devrait gérer une année récente', () => {
      // Arrange
      const recentCD = { ...mockCD, year: 2024 };

      // Act
      render(<CDItem cd={recentCD} onDelete={mockOnDelete} />);

      // Assert
      expect(screen.getByText(/2024/)).toBeInTheDocument();
    });

    it('devrait gérer une année ancienne', () => {
      // Arrange
      const oldCD = { ...mockCD, year: 1950 };

      // Act
      render(<CDItem cd={oldCD} onDelete={mockOnDelete} />);

      // Assert
      expect(screen.getByText(/1950/)).toBeInTheDocument();
    });

    it('devrait afficher correctement un CD avec des caractères spéciaux', () => {
      // Arrange
      const specialCD = {
        id: 1,
        title: 'Ça c\'est l\'été!',
        artist: 'Artiste & Groupe',
        year: 2020
      };

      // Act
      render(<CDItem cd={specialCD} onDelete={mockOnDelete} />);

      // Assert
      expect(screen.getByText(/Ça c'est l'été!/)).toBeInTheDocument();
      expect(screen.getByText(/Artiste & Groupe/)).toBeInTheDocument();
    });
  });

  describe('Structure du composant', () => {
    it('devrait rendre un élément li', () => {
      // Arrange
      const { container } = render(<CDItem cd={mockCD} onDelete={mockOnDelete} />);

      // Assert
      const li = container.querySelector('li');
      expect(li).toBeInTheDocument();
    });

    it('devrait contenir un span pour les informations', () => {
      // Arrange
      const { container } = render(<CDItem cd={mockCD} onDelete={mockOnDelete} />);

      // Assert
      const span = container.querySelector('span');
      expect(span).toBeInTheDocument();
    });
  });
});
