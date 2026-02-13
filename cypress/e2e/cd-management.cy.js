describe('Gestion des CD - Tests E2E', () => {
  beforeEach(() => {
    // Visiter la page d'accueil avant chaque test
    cy.visit('/');
  });

  it('devrait afficher la page d\'accueil', () => {
    cy.contains('Liste des CD').should('be.visible');
    cy.contains('Ajouter un CD').should('be.visible');
  });

  it('devrait ajouter un nouveau CD', () => {
    // Remplir le formulaire
    cy.get('input[name="title"]').type('Abbey Road');
    cy.get('input[name="artist"]').type('The Beatles');
    cy.get('input[name="year"]').type('1969');

    // Soumettre le formulaire
    cy.get('button[type="submit"]').click();

    // Vérifier que le CD apparaît dans la liste
    cy.contains('Abbey Road').should('be.visible');
    cy.contains('The Beatles').should('be.visible');
    cy.contains('1969').should('be.visible');
  });

  it('devrait afficher les CD disponibles', () => {
    // Ajouter un CD
    cy.get('input[name="title"]').type('Thriller');
    cy.get('input[name="artist"]').type('Michael Jackson');
    cy.get('input[name="year"]').type('1982');
    cy.get('button[type="submit"]').click();

    // Vérifier que le CD est affiché
    cy.contains('Thriller').should('be.visible');
    cy.contains('Michael Jackson').should('be.visible');

    // Vérifier que la liste contient au moins un élément
    cy.get('ul li').should('have.length.at.least', 1);
  });

  it('devrait supprimer un CD', () => {
    // Ajouter un CD
    cy.get('input[name="title"]').type('CD à supprimer');
    cy.get('input[name="artist"]').type('Artiste Test');
    cy.get('input[name="year"]').type('2020');
    cy.get('button[type="submit"]').click();

    // Vérifier que le CD est ajouté
    cy.contains('CD à supprimer').should('be.visible');

    // Supprimer le CD
    cy.contains('CD à supprimer')
      .parent()
      .find('button')
      .contains('Supprimer')
      .click();

    // Vérifier que le CD n'est plus visible
    cy.contains('CD à supprimer').should('not.exist');
  });

  it('devrait effectuer un cycle complet : ajouter, afficher, supprimer', () => {
    // Étape 1 : Ajouter un CD
    cy.get('input[name="title"]').type('Dark Side of the Moon');
    cy.get('input[name="artist"]').type('Pink Floyd');
    cy.get('input[name="year"]').type('1973');
    cy.get('button[type="submit"]').click();

    // Étape 2 : Vérifier l'affichage
    cy.contains('Dark Side of the Moon').should('be.visible');
    cy.contains('Pink Floyd').should('be.visible');
    cy.contains('1973').should('be.visible');

    // Étape 3 : Supprimer le CD
    cy.contains('Dark Side of the Moon')
      .parent()
      .find('button')
      .contains('Supprimer')
      .click();

    // Étape 4 : Vérifier la suppression
    cy.contains('Dark Side of the Moon').should('not.exist');
  });

  it('devrait ajouter plusieurs CDs', () => {
    // Ajouter le premier CD
    cy.get('input[name="title"]').type('CD 1');
    cy.get('input[name="artist"]').type('Artiste 1');
    cy.get('input[name="year"]').type('2020');
    cy.get('button[type="submit"]').click();

    // Vérifier l'ajout
    cy.contains('CD 1').should('be.visible');

    // Ajouter le deuxième CD
    cy.get('input[name="title"]').type('CD 2');
    cy.get('input[name="artist"]').type('Artiste 2');
    cy.get('input[name="year"]').type('2021');
    cy.get('button[type="submit"]').click();

    // Vérifier que les deux CDs sont affichés
    cy.contains('CD 1').should('be.visible');
    cy.contains('CD 2').should('be.visible');
  });

  it('devrait valider les champs requis', () => {
    // Essayer de soumettre sans remplir les champs
    cy.get('button[type="submit"]').click();

    // Les champs devraient être requis (HTML5 validation)
    cy.get('input[name="title"]').should('have.attr', 'required');
    cy.get('input[name="artist"]').should('have.attr', 'required');
    cy.get('input[name="year"]').should('have.attr', 'required');
  });

  it('devrait réinitialiser le formulaire après ajout', () => {
    // Remplir et soumettre
    cy.get('input[name="title"]').type('Test Reset');
    cy.get('input[name="artist"]').type('Test Artist');
    cy.get('input[name="year"]').type('2022');
    cy.get('button[type="submit"]').click();

    // Vérifier que les champs sont vides
    cy.get('input[name="title"]').should('have.value', '');
    cy.get('input[name="artist"]').should('have.value', '');
    cy.get('input[name="year"]').should('have.value', '');
  });
});
