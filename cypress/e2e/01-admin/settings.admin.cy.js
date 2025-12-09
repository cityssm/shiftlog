"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _globals_js_1 = require("../../../test/_globals.js");
var index_js_1 = require("../../support/index.js");
describe('Admin - Application Settings', function () {
    beforeEach('Loads page', function () {
        (0, index_js_1.logout)();
        (0, index_js_1.login)(_globals_js_1.testAdmin);
        cy.visit('/admin/settings');
        cy.location('pathname').should('equal', '/admin/settings');
    });
    afterEach(index_js_1.logout);
    it('Has no detectable accessibility issues', function () {
        cy.injectAxe();
        cy.checkA11y();
    });
    it('Can update a setting', function () {
        // Find the first editable setting (text input)
        cy.get('.settingForm')
            .has('input.input[type="text"]')
            .first()
            .within(function () {
            // Get the current value
            cy.get('input.input[type="text"]')
                .invoke('val')
                .then(function (originalValue) {
                // Change the value
                var newValue = "".concat(originalValue, "-test");
                cy.get('input.input[type="text"]').clear().type(newValue);
                // Submit the form
                cy.get('form').submit();
                // Wait for AJAX response
                cy.wait(index_js_1.ajaxDelayMillis);
                // Verify success (the warning background should be removed)
                cy.get('input.input[type="text"]').should('not.have.class', 'has-background-warning-light');
                // Restore the original value
                cy.get('input.input[type="text"]').clear().type(originalValue.toString());
                cy.get('form').submit();
                cy.wait(index_js_1.ajaxDelayMillis);
            });
        });
    });
    it('Highlights changed settings', function () {
        // Find the first text input setting
        cy.get('.settingForm input.input[type="text"]').first().as('settingInput');
        // Change the value
        cy.get('@settingInput').type('-changed');
        // Verify the input has the warning background
        cy.get('@settingInput').should('have.class', 'has-background-warning-light');
    });
    it('Can filter settings', function () {
        // Type in the filter
        cy.get('#settingsFilter').type('application');
        // Wait a moment for the filter to apply
        cy.wait(200);
        // Verify some rows are hidden
        cy.get('#settingsTableBody tr.is-hidden').should('exist');
        // Clear the filter
        cy.get('#settingsFilter').clear();
        // Wait a moment
        cy.wait(200);
        // Verify all rows are visible
        cy.get('#settingsTableBody tr').should('not.have.class', 'is-hidden');
    });
});
