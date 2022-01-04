context('Listi - Filters :: Read', () => {
	before(() => {
		//todo inject db doc
	});

	beforeEach(() => {
		cy.visit('#/filters');
	});

	after(() => {
		//todo cleanup db doc
	});

	it('Opens the New Filter View via URL', () => {
		cy.get('.view.filters').should('be.visible');

		cy.visit('#/filters/new');

		cy.get('.view.filterEdit').should('be.visible');
	});

	it('Opens the New Filter View via Toolbar', () => {
		cy.get('.iconButton.fa-plus').click();

		cy.contains('.dialog .header', /create/i).should('be.visible');

		cy.contains('.dialog .footer .button', /filter/i).click();

		cy.get('.view.filterEdit').should('be.visible');
	});

	it('Opens the Edit Filter View via the Filters View', () => {
		cy.contains('.list .filterCard', /test-filter/i)
			.children('.iconButton.fa-edit')
			.click({ force: true });

		cy.get('.view.filterEdit').should('be.visible');

		cy.contains('.content .label', /name/i).children('.textInput').should('have.value', 'test-filter');

		// cy.contains('.tag:not(.addTag)', /test-tag/i).should('be.visible');
	});
});