"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _globals_js_1 = require("../../../test/_globals.js");
var index_js_1 = require("../../support/index.js");
describe('Admin - User Group Management', function () {
    beforeEach('Loads page', function () {
        (0, index_js_1.logout)();
        (0, index_js_1.login)(_globals_js_1.testAdmin);
        cy.visit('/admin/userGroups');
        cy.location('pathname').should('equal', '/admin/userGroups');
    });
    afterEach(index_js_1.logout);
    it('Has no detectable accessibility issues', function () {
        cy.injectAxe();
        cy.checkA11y();
    });
    it('Can add a user group', function () {
        // Click the Add User Group button
        cy.get('#button--addUserGroup').click();
        // Wait for modal to appear
        cy.get('#modal--addUserGroup').should('be.visible');
        // Fill in the user group details
        var testGroupName = "Test Group ".concat(Date.now());
        cy.get('#addUserGroup--groupName').type(testGroupName);
        // Submit the form
        cy.get('#form--addUserGroup').submit();
        // Wait for AJAX response
        cy.wait(index_js_1.ajaxDelayMillis);
        // Verify the user group appears in the container
        cy.get('#container--userGroups')
            .contains(testGroupName)
            .should('exist');
    });
    it('Can update a user group', function () {
        // Find the first edit button and click it
        cy.get('#container--userGroups')
            .find('button[title*="Edit"]')
            .first()
            .click();
        // Wait for modal to appear
        cy.get('#modal--editUserGroup').should('be.visible');
        // Update the group name
        var updatedText = " - Updated ".concat(Date.now());
        cy.get('#editUserGroup--groupName')
            .invoke('val')
            .then(function (originalValue) {
            cy.get('#editUserGroup--groupName')
                .clear()
                .type(originalValue + updatedText);
        });
        // Submit the form
        cy.get('#form--editUserGroup').submit();
        // Wait for AJAX response
        cy.wait(index_js_1.ajaxDelayMillis);
        // Verify the updated group appears
        cy.get('#container--userGroups')
            .contains(updatedText)
            .should('exist');
    });
    it('Can delete a user group', function () {
        // First, add a user group to delete
        cy.get('#button--addUserGroup').click();
        var testGroupName = "Delete Group ".concat(Date.now());
        cy.get('#addUserGroup--groupName').type(testGroupName);
        cy.get('#form--addUserGroup').submit();
        cy.wait(index_js_1.ajaxDelayMillis);
        // Find and click the delete button
        cy.get('#container--userGroups')
            .contains(testGroupName)
            .parents('.panel-block')
            .find('button[title*="Delete"]')
            .click();
        // Wait for confirmation modal
        cy.wait(200);
        // Confirm deletion
        cy.get('.modal.is-active')
            .contains('button', 'Delete Group')
            .click();
        // Wait for AJAX response
        cy.wait(index_js_1.ajaxDelayMillis);
        // Verify the group is removed
        cy.get('#container--userGroups')
            .contains(testGroupName)
            .should('not.exist');
    });
});
