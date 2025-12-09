"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _globals_js_1 = require("../../../test/_globals.js");
var index_js_1 = require("../../support/index.js");
describe('Admin - Data List Management', function () {
    beforeEach('Loads page', function () {
        (0, index_js_1.logout)();
        (0, index_js_1.login)(_globals_js_1.testAdmin);
        cy.visit('/admin/dataLists');
        cy.location('pathname').should('equal', '/admin/dataLists');
    });
    afterEach(index_js_1.logout);
    it('Has no detectable accessibility issues', function () {
        cy.injectAxe();
        cy.checkA11y();
    });
    it('Can add a data list item', function () {
        // Click the first Add Item button
        cy.get('.button--addItem').first().click();
        // Wait for modal to appear
        cy.get('.modal.is-active').should('be.visible');
        // Fill in the item details
        var testItemName = "Test Item ".concat(Date.now());
        cy.get('input[name="dataListItem"]').type(testItemName);
        // Submit the form
        cy.get('.modal.is-active form').submit();
        // Wait for AJAX response
        cy.wait(index_js_1.ajaxDelayMillis);
        // Verify the item appears
        cy.contains(testItemName).should('exist');
    });
    it('Can update a data list item', function () {
        // Find the first edit button and click it
        cy.get('button[title*="Edit"]').first().click();
        // Wait for modal to appear
        cy.get('.modal.is-active').should('be.visible');
        // Update the item
        var updatedText = " - Updated ".concat(Date.now());
        cy.get('input[name="dataListItem"]')
            .invoke('val')
            .then(function (originalValue) {
            cy.get('input[name="dataListItem"]')
                .clear()
                .type(originalValue + updatedText);
        });
        // Submit the form
        cy.get('.modal.is-active form').submit();
        // Wait for AJAX response
        cy.wait(index_js_1.ajaxDelayMillis);
        // Verify the updated item appears
        cy.contains(updatedText).should('exist');
    });
    it('Can delete a data list item', function () {
        // First, add an item to delete
        cy.get('.button--addItem').first().click();
        var testItemName = "Delete Item ".concat(Date.now());
        cy.get('input[name="dataListItem"]').type(testItemName);
        cy.get('.modal.is-active form').submit();
        cy.wait(index_js_1.ajaxDelayMillis);
        // Find and click the delete button for this item
        cy.contains(testItemName)
            .parents('tr')
            .find('button[title*="Delete"]')
            .click();
        // Wait for confirmation modal
        cy.wait(200);
        // Confirm deletion
        cy.get('.modal.is-active')
            .contains('button', 'Delete')
            .click();
        // Wait for AJAX response
        cy.wait(index_js_1.ajaxDelayMillis);
        // Verify the item is removed
        cy.contains(testItemName).should('not.exist');
    });
});
