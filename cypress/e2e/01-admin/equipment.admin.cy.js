import { testAdmin } from '../../../test/_globals.js';
import { ajaxDelayMillis, login, logout } from '../../support/index.js';
describe('Admin - Equipment Maintenance', () => {
    beforeEach('Loads page', () => {
        logout();
        login(testAdmin);
        cy.visit('/admin/equipment');
        cy.location('pathname').should('equal', '/admin/equipment');
    });
    afterEach(logout);
    it('Has no detectable accessibility issues', () => {
        cy.injectAxe();
        cy.checkA11y();
    });
    it.skip('Can add equipment', () => {
        // Click the Add Equipment button
        cy.get('#button--addEquipment').click();
        // Wait for modal to appear
        cy.get('#modal--addEquipment').should('be.visible');
        // Fill in the equipment details
        const testEquipment = `Test Equipment ${Date.now()}`;
        cy.get('#addEquipment--equipmentName').type(testEquipment);
        // Submit the form
        cy.get('#form--addEquipment').submit();
        // Wait for AJAX response
        cy.wait(ajaxDelayMillis);
        // Verify the equipment appears in the container
        cy.get('#container--equipment')
            .contains(testEquipment)
            .should('exist');
    });
    it.skip('Can update equipment', () => {
        // Find the first edit button and click it
        cy.get('#container--equipment')
            .find('button[title*="Edit"]')
            .first()
            .click();
        // Wait for modal to appear
        cy.get('#modal--editEquipment').should('be.visible');
        // Update the equipment name
        const updatedText = ` - Updated ${Date.now()}`;
        cy.get('#editEquipment--equipmentName')
            .invoke('val')
            .then((originalValue) => {
            cy.get('#editEquipment--equipmentName')
                .clear()
                .type(originalValue + updatedText);
        });
        // Submit the form
        cy.get('#form--editEquipment').submit();
        // Wait for AJAX response
        cy.wait(ajaxDelayMillis);
        // Verify the updated equipment appears
        cy.get('#container--equipment')
            .contains(updatedText)
            .should('exist');
    });
    it.skip('Can delete equipment', () => {
        // First, add equipment to delete
        cy.get('#button--addEquipment').click();
        const testEquipment = `Delete Equipment ${Date.now()}`;
        cy.get('#addEquipment--equipmentName').type(testEquipment);
        cy.get('#form--addEquipment').submit();
        cy.wait(ajaxDelayMillis);
        // Find and click the delete button
        cy.get('#container--equipment')
            .contains(testEquipment)
            .parents('.panel-block')
            .find('button[title*="Delete"]')
            .click();
        // Wait for confirmation modal
        cy.wait(200);
        // Confirm deletion
        cy.get('.modal.is-active')
            .contains('button', 'Delete Equipment')
            .click();
        // Wait for AJAX response
        cy.wait(ajaxDelayMillis);
        // Verify the equipment is removed
        cy.get('#container--equipment')
            .contains(testEquipment)
            .should('not.exist');
    });
});
