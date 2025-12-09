"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _globals_js_1 = require("../../../test/_globals.js");
var index_js_1 = require("../../support/index.js");
describe('Admin - Work Order Type Maintenance', function () {
    beforeEach('Loads page', function () {
        (0, index_js_1.logout)();
        (0, index_js_1.login)(_globals_js_1.testAdmin);
        cy.visit('/admin/workOrderTypes');
        cy.location('pathname').should('equal', '/admin/workOrderTypes');
    });
    afterEach(index_js_1.logout);
    it('Has no detectable accessibility issues', function () {
        cy.injectAxe();
        cy.checkA11y();
    });
    it('Can add a work order type', function () {
        // Click the Add Work Order Type button
        cy.get('#button--addWorkOrderType').click();
        // Wait for modal to appear
        cy.get('#modal--addWorkOrderType').should('be.visible');
        // Fill in the work order type details
        var testTypeName = "Test Type ".concat(Date.now());
        cy.get('#addWorkOrderType--workOrderType').type(testTypeName);
        // Submit the form
        cy.get('#form--addWorkOrderType').submit();
        // Wait for AJAX response
        cy.wait(index_js_1.ajaxDelayMillis);
        // Verify the work order type appears in the container
        cy.get('#container--workOrderTypes')
            .contains(testTypeName)
            .should('exist');
    });
    it('Can update a work order type', function () {
        // Find the first edit button and click it
        cy.get('#container--workOrderTypes')
            .find('button[title*="Edit"]')
            .first()
            .click();
        // Wait for modal to appear
        cy.get('#modal--editWorkOrderType').should('be.visible');
        // Update the work order type
        var updatedText = " - Updated ".concat(Date.now());
        cy.get('#editWorkOrderType--workOrderType')
            .invoke('val')
            .then(function (originalValue) {
            cy.get('#editWorkOrderType--workOrderType')
                .clear()
                .type(originalValue + updatedText);
        });
        // Submit the form
        cy.get('#form--editWorkOrderType').submit();
        // Wait for AJAX response
        cy.wait(index_js_1.ajaxDelayMillis);
        // Verify the updated work order type appears
        cy.get('#container--workOrderTypes')
            .contains(updatedText)
            .should('exist');
    });
    it('Can delete a work order type', function () {
        // First, add a work order type to delete
        cy.get('#button--addWorkOrderType').click();
        var testTypeName = "Delete Type ".concat(Date.now());
        cy.get('#addWorkOrderType--workOrderType').type(testTypeName);
        cy.get('#form--addWorkOrderType').submit();
        cy.wait(index_js_1.ajaxDelayMillis);
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
        cy.wait(index_js_1.ajaxDelayMillis);
        // Verify the work order type is removed
        cy.get('#container--workOrderTypes')
            .contains(testTypeName)
            .should('not.exist');
    });
});
