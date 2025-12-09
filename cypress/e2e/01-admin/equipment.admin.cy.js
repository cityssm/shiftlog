"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _globals_js_1 = require("../../../test/_globals.js");
var index_js_1 = require("../../support/index.js");
describe('Admin - Equipment Maintenance', function () {
    beforeEach('Loads page', function () {
        (0, index_js_1.logout)();
        (0, index_js_1.login)(_globals_js_1.testAdmin);
        cy.visit('/admin/equipment');
        cy.location('pathname').should('equal', '/admin/equipment');
    });
    afterEach(index_js_1.logout);
    it('Has no detectable accessibility issues', function () {
        cy.injectAxe();
        cy.checkA11y();
    });
    it('Can add equipment', function () {
        // Click the Add Equipment button
        cy.get('#button--addEquipment').click();
        // Wait for modal to appear
        cy.get('#modal--addEquipment').should('be.visible');
        // Fill in the equipment details
        var testEquipment = "Test Equipment ".concat(Date.now());
        cy.get('#addEquipment--equipmentName').type(testEquipment);
        // Submit the form
        cy.get('#form--addEquipment').submit();
        // Wait for AJAX response
        cy.wait(index_js_1.ajaxDelayMillis);
        // Verify the equipment appears in the container
        cy.get('#container--equipment')
            .contains(testEquipment)
            .should('exist');
    });
    it('Can update equipment', function () {
        // Find the first edit button and click it
        cy.get('#container--equipment')
            .find('button[title*="Edit"]')
            .first()
            .click();
        // Wait for modal to appear
        cy.get('#modal--editEquipment').should('be.visible');
        // Update the equipment name
        var updatedText = " - Updated ".concat(Date.now());
        cy.get('#editEquipment--equipmentName')
            .invoke('val')
            .then(function (originalValue) {
            cy.get('#editEquipment--equipmentName')
                .clear()
                .type(originalValue + updatedText);
        });
        // Submit the form
        cy.get('#form--editEquipment').submit();
        // Wait for AJAX response
        cy.wait(index_js_1.ajaxDelayMillis);
        // Verify the updated equipment appears
        cy.get('#container--equipment')
            .contains(updatedText)
            .should('exist');
    });
    it('Can delete equipment', function () {
        // First, add equipment to delete
        cy.get('#button--addEquipment').click();
        var testEquipment = "Delete Equipment ".concat(Date.now());
        cy.get('#addEquipment--equipmentName').type(testEquipment);
        cy.get('#form--addEquipment').submit();
        cy.wait(index_js_1.ajaxDelayMillis);
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
        cy.wait(index_js_1.ajaxDelayMillis);
        // Verify the equipment is removed
        cy.get('#container--equipment')
            .contains(testEquipment)
            .should('not.exist');
    });
});
