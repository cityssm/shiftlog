"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _globals_js_1 = require("../../../test/_globals.js");
var index_js_1 = require("../../support/index.js");
describe('Admin - Tag Maintenance', function () {
    beforeEach('Loads page', function () {
        (0, index_js_1.logout)();
        (0, index_js_1.login)(_globals_js_1.testAdmin);
        cy.visit('/admin/tags');
        cy.location('pathname').should('equal', '/admin/tags');
    });
    afterEach(index_js_1.logout);
    it('Has no detectable accessibility issues', function () {
        cy.injectAxe();
        cy.checkA11y();
    });
    it('Can add a tag', function () {
        // Click the Add Tag button
        cy.get('#button--addTag').click();
        // Wait for modal to appear
        cy.get('#modal--addTag').should('be.visible');
        // Fill in the tag details
        var testTagName = "Test Tag ".concat(Date.now());
        cy.get('#addTag--tagName').type(testTagName);
        // Submit the form
        cy.get('#form--addTag').submit();
        // Wait for AJAX response
        cy.wait(index_js_1.ajaxDelayMillis);
        // Verify the tag appears in the container
        cy.get('#container--tags')
            .contains(testTagName)
            .should('exist');
    });
    it('Can update a tag', function () {
        // Find the first edit button and click it
        cy.get('#container--tags')
            .find('button[title*="Edit"]')
            .first()
            .click();
        // Wait for modal to appear
        cy.get('#modal--editTag').should('be.visible');
        // Update the tag name
        var updatedText = " - Updated ".concat(Date.now());
        cy.get('#editTag--tagName')
            .invoke('val')
            .then(function (originalValue) {
            cy.get('#editTag--tagName')
                .clear()
                .type(originalValue + updatedText);
        });
        // Submit the form
        cy.get('#form--editTag').submit();
        // Wait for AJAX response
        cy.wait(index_js_1.ajaxDelayMillis);
        // Verify the updated tag appears
        cy.get('#container--tags')
            .contains(updatedText)
            .should('exist');
    });
    it('Can delete a tag', function () {
        // First, add a tag to delete
        cy.get('#button--addTag').click();
        var testTagName = "Delete Tag ".concat(Date.now());
        cy.get('#addTag--tagName').type(testTagName);
        cy.get('#form--addTag').submit();
        cy.wait(index_js_1.ajaxDelayMillis);
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
        cy.wait(index_js_1.ajaxDelayMillis);
        // Verify the tag is removed
        cy.get('#container--tags')
            .contains(testTagName)
            .should('not.exist');
    });
});
