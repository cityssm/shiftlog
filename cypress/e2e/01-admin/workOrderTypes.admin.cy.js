import { testAdmin } from '../../../test/_globals.js';
import { ajaxDelayMillis, login, logout } from '../../support/index.js';
describe('Admin - Work Order Type Maintenance', () => {
    beforeEach('Loads page', () => {
        logout();
        login(testAdmin);
        cy.visit('/admin/workOrderTypes');
        cy.location('pathname').should('equal', '/admin/workOrderTypes');
    });
    afterEach(logout);
    it('Has no detectable accessibility issues', () => {
        cy.injectAxe();
        cy.checkA11y();
    });
    it('Can add a work order type', () => {
        // Click the Add Work Order Type button
        cy.get('#button--addWorkOrderType').click();
        // Wait for modal to appear
        cy.get('#modal--addWorkOrderType').should('be.visible');
        // Fill in the work order type details
        const testTypeName = `Test Type ${Date.now()}`;
        cy.get('#addWorkOrderType--workOrderType').type(testTypeName);
        // Submit the form
        cy.get('#form--addWorkOrderType').submit();
        // Wait for AJAX response
        cy.wait(ajaxDelayMillis);
        // Verify the work order type appears in the container
        cy.get('#container--workOrderTypes')
            .contains(testTypeName)
            .should('exist');
    });
    it('Can update a work order type', () => {
        // Find the first edit button and click it
        cy.get('#container--workOrderTypes')
            .find('button[title*="Edit"]')
            .first()
            .click();
        // Wait for modal to appear
        cy.get('#modal--editWorkOrderType').should('be.visible');
        // Update the work order type
        const updatedText = ` - Updated ${Date.now()}`;
        cy.get('#editWorkOrderType--workOrderType')
            .invoke('val')
            .then((originalValue) => {
            cy.get('#editWorkOrderType--workOrderType')
                .clear()
                .type(originalValue + updatedText);
        });
        // Submit the form
        cy.get('#form--editWorkOrderType').submit();
        // Wait for AJAX response
        cy.wait(ajaxDelayMillis);
        // Verify the updated work order type appears
        cy.get('#container--workOrderTypes')
            .contains(updatedText)
            .should('exist');
    });
    it('Can delete a work order type', () => {
        // First, add a work order type to delete
        cy.get('#button--addWorkOrderType').click();
        const testTypeName = `Delete Type ${Date.now()}`;
        cy.get('#addWorkOrderType--workOrderType').type(testTypeName);
        cy.get('#form--addWorkOrderType').submit();
        cy.wait(ajaxDelayMillis);
        // Find and click the delete button
        cy.get('#container--workOrderTypes')
            .contains(testTypeName)
            .parents('.panel-block')
            .find('button[title*="Delete"]')
            .click();
        // Wait for confirmation modal
        cy.wait(200);
        // Confirm deletion
        cy.get('.modal.is-active')
            .contains('button', 'Delete')
            .click();
        // Wait for AJAX response
        cy.wait(ajaxDelayMillis);
        // Verify the work order type is removed
        cy.get('#container--workOrderTypes')
            .contains(testTypeName)
            .should('not.exist');
    });
});
