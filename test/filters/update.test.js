context('Listi - Filters :: Update', () => {
	before(() => {
		cy.visit('#/filters');

		//todo inject db doc
	});

	after(() => {
		//todo cleanup db doc
	});

	it('Adds a tag to a filter', () => {
		cy.contains('.list .filterCard', /test-filter/i)
			.children('.iconButton.fa-edit')
			.click({ force: true });

		cy.get('.view.filterEdit').should('be.visible');

		cy.get('.addTag .textInput').type('test-tag');

		cy.get('.addTag .iconButton').click();

		cy.contains('.tag:not(.addTag)', /test-tag/i).should('be.visible');

		cy.get('.toolbar .iconButton.fa-save').click();

		cy.get('.view.filters').should('be.visible');
	});
});
