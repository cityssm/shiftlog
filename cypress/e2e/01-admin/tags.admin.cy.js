import { testAdmin } from '../../../test/_globals.js';
import { ajaxDelayMillis, login, logout } from '../../support/index.js';
describe('Admin - Tag Maintenance', () => {
    beforeEach('Loads page', () => {
        logout();
        login(testAdmin);
        cy.visit('/admin/tags');
        cy.location('pathname').should('equal', '/admin/tags');
    });
    afterEach(logout);
    it('Has no detectable accessibility issues', () => {
        cy.injectAxe();
        cy.checkA11y();
    });
    it('Can add a tag', () => {
        // Click the Add Tag button
        cy.get('#button--addTag').click();
        // Wait for modal to appear
        cy.get('#modal--addTag').should('be.visible');
        // Fill in the tag details
        const testTagName = `Test Tag ${Date.now()}`;
        cy.get('#addTag--tagName').type(testTagName);
        // Submit the form
        cy.get('#form--addTag').submit();
        // Wait for AJAX response
        cy.wait(ajaxDelayMillis);
        // Verify the tag appears in the container
        cy.get('#container--tags')
            .contains(testTagName)
            .should('exist');
    });
    it('Can update a tag', () => {
        // Find the first edit button and click it
        cy.get('#container--tags')
            .find('button[title*="Edit"]')
            .first()
            .click();
        // Wait for modal to appear
        cy.get('#modal--editTag').should('be.visible');
        // Update the tag name
        const updatedText = ` - Updated ${Date.now()}`;
        cy.get('#editTag--tagName')
            .invoke('val')
            .then((originalValue) => {
            cy.get('#editTag--tagName')
                .clear()
                .type(originalValue + updatedText);
        });
        // Submit the form
        cy.get('#form--editTag').submit();
        // Wait for AJAX response
        cy.wait(ajaxDelayMillis);
        // Verify the updated tag appears
        cy.get('#container--tags')
            .contains(updatedText)
            .should('exist');
    });
    it('Can delete a tag', () => {
        // First, add a tag to delete
        cy.get('#button--addTag').click();
        const testTagName = `Delete Tag ${Date.now()}`;
        cy.get('#addTag--tagName').type(testTagName);
        cy.get('#form--addTag').submit();
        cy.wait(ajaxDelayMillis);
        // Find and click the delete button
        cy.get('#container--tags')
            .contains(testTagName)
            .parents('.panel-block')
            .find('button[title*="Delete"]')
            .click();
        // Wait for confirmation modal
        cy.wait(200);
        // Confirm deletion
        cy.get('.modal.is-active')
            .contains('button', 'Delete Tag')
            .click();
        // Wait for AJAX response
        cy.wait(ajaxDelayMillis);
        // Verify the tag is removed
        cy.get('#container--tags')
            .contains(testTagName)
            .should('not.exist');
    });
});
