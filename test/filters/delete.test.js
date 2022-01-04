context('Listi - Filters :: Delete', () => {
	before(() => {
		cy.visit('#/filters');

		//todo inject db doc
	});

	after(() => {
		//todo cleanup db doc
	});

	it('Deletes a filter', () => {
		cy.contains('.list .filterCard', /test-filter/i)
			.children('.iconButton.fa-edit')
			.click({ force: true });

		cy.get('.view.filterEdit').should('be.visible');

		cy.get('.toolbar .iconButton.fa-trash-alt').click();

		cy.contains('.dialog .header', /attention/i).should('be.visible');
		cy.contains('.dialog .content', /delete/i).should('be.visible');

		cy.contains('.dialog .footer .button', /yes/i).click({ force: true });

		cy.get('.view.filters').should('be.visible');

		// cy.contains('.list .filterCard', /test-filter/i).should('not.exist');
	});
});
