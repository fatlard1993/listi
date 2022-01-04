context('Listi - Filters :: Create', () => {
	before(() => {
		cy.visit('#/filters/new');
	});

	after(() => {
		//todo cleanup db doc
	});

	it('Creates a new filter', () => {
		cy.contains('.content .label', /name/i).children('.textInput').type('test-filter');

		cy.get('.toolbar .iconButton.fa-save').click();

		cy.get('.view.filters').should('be.visible');
	});
});
