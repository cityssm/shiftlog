import { testAdmin } from '../../../test/_globals.js';
import { ajaxDelayMillis, login, logout } from '../../support/index.js';
describe('Admin - Data List Management', () => {
    beforeEach('Loads page', () => {
        logout();
        login(testAdmin);
        cy.visit('/admin/dataLists');
        cy.location('pathname').should('equal', '/admin/dataLists');
    });
    afterEach(logout);
    it('Has no detectable accessibility issues', () => {
        cy.injectAxe();
        cy.checkA11y();
    });
    it('Can add a data list item', () => {
        cy.get('details').first().get('summary').first().click();
        cy.get('.button--addItem').first().click();
        cy.get('.modal.is-active').should('be.visible');
        const testItemName = `Test Item ${Date.now()}`;
        cy.get('#addDataListItem--dataListItem').type(testItemName);
        cy.get('.modal form').submit();
        cy.wait(ajaxDelayMillis);
        cy.contains(testItemName).should('exist');
    });
    it('Can update a data list item', () => {
        cy.get('details').first().get('summary').first().click();
        cy.get('.button--editItem').first().click();
        cy.get('.modal.is-active').should('be.visible');
        const updatedText = ` - Updated ${Date.now()}`;
        cy.get('#editDataListItem--dataListItem')
            .invoke('val')
            .then((originalValue) => {
            cy.get('#editDataListItem--dataListItem')
                .clear()
                .type(originalValue + updatedText);
        });
        cy.get('.modal form').submit();
        cy.wait(ajaxDelayMillis);
        cy.contains(updatedText).should('exist');
    });
    it('Can delete a data list item', () => {
        cy.get('details').first().get('summary').first().click();
        cy.get('.button--addItem').first().click();
        const testItemName = `Delete Item ${Date.now()}`;
        cy.get('#addDataListItem--dataListItem').type(testItemName);
        cy.get('.modal form').submit();
        cy.wait(ajaxDelayMillis);
        cy.get('.modal button[data-cy="ok"]').click();
        cy.wait(ajaxDelayMillis);
        cy.contains(testItemName)
            .parents('tr')
            .find('button.button--deleteItem')
            .click();
        cy.wait(200);
        cy.get('.modal.is-active').contains('button', 'Delete').click();
        cy.wait(ajaxDelayMillis);
        cy.contains(testItemName).should('not.exist');
    });
});
