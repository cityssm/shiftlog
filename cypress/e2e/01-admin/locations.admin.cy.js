import { testAdmin } from '../../../test/_globals.js';
import { ajaxDelayMillis, login, logout } from '../../support/index.js';
describe('Admin - Location Maintenance', () => {
    beforeEach('Loads page', () => {
        logout();
        login(testAdmin);
        cy.visit('/admin/locations');
        cy.location('pathname').should('equal', '/admin/locations');
    });
    afterEach(logout);
    it('Has no detectable accessibility issues', () => {
        cy.injectAxe();
        cy.checkA11y();
    });
    it('Can add a location', () => {
        // Click the Add Location button
        cy.get('#button--addLocation').click();
        // Wait for modal to appear
        cy.get('#modal--addLocation').should('be.visible');
        // Fill in the location details
        const testAddress = `Test Address ${Date.now()}`;
        cy.get('#addLocation--address1').type(testAddress);
        cy.get('#addLocation--address2').type('Suite 100');
        cy.get('#addLocation--cityProvince').type('Test City');
        // Submit the form
        cy.get('#form--addLocation').submit();
        // Wait for AJAX response
        cy.wait(ajaxDelayMillis);
        // Verify the location appears in the container
        cy.get('#container--locations')
            .contains(testAddress)
            .should('exist');
    });
    it('Can update a location', () => {
        // Find the first edit button and click it
        cy.get('#container--locations')
            .find('button[title*="Edit"]')
            .first()
            .click();
        // Wait for modal to appear
        cy.get('#modal--editLocation').should('be.visible');
        // Update the address
        const updatedText = ` - Updated ${Date.now()}`;
        cy.get('#editLocation--address1')
            .invoke('val')
            .then((originalValue) => {
            cy.get('#editLocation--address1')
                .clear()
                .type(originalValue + updatedText);
        });
        // Submit the form
        cy.get('#form--editLocation').submit();
        // Wait for AJAX response
        cy.wait(ajaxDelayMillis);
        // Verify the updated location appears
        cy.get('#container--locations')
            .contains(updatedText)
            .should('exist');
    });
    it('Can delete a location', () => {
        // First, add a location to delete
        cy.get('#button--addLocation').click();
        const testAddress = `Delete Location ${Date.now()}`;
        cy.get('#addLocation--address1').type(testAddress);
        cy.get('#form--addLocation').submit();
        cy.wait(ajaxDelayMillis);
        // Find and click the delete button
        cy.get('#container--locations')
            .contains(testAddress)
            .parents('.panel-block')
            .find('button[title*="Delete"]')
            .click();
        // Wait for confirmation modal
        cy.wait(200);
        // Confirm deletion
        cy.get('.modal.is-active')
            .contains('button', 'Delete Location')
            .click();
        // Wait for AJAX response
        cy.wait(ajaxDelayMillis);
        // Verify the location is removed
        cy.get('#container--locations')
            .contains(testAddress)
            .should('not.exist');
    });
});
