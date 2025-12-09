"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _globals_js_1 = require("../../../test/_globals.js");
var index_js_1 = require("../../support/index.js");
describe('Admin - User Management', function () {
    beforeEach('Loads page', function () {
        (0, index_js_1.logout)();
        (0, index_js_1.login)(_globals_js_1.testAdmin);
        cy.visit('/admin/users');
        cy.location('pathname').should('equal', '/admin/users');
    });
    afterEach(index_js_1.logout);
    it('Has no detectable accessibility issues', function () {
        cy.injectAxe();
        cy.checkA11y();
    });
    it('Can add a user', function () {
        // Click the Add User button
        cy.get('#button--addUser').click();
        // Wait for modal to appear
        cy.get('#modal--addUser').should('be.visible');
        // Fill in the username
        var testUserName = "testuser".concat(Date.now());
        cy.get('#userName').type(testUserName);
        // Submit the form
        cy.get('#form--addUser').submit();
        // Wait for AJAX response
        cy.wait(index_js_1.ajaxDelayMillis);
        // Verify the user appears in the table
        cy.get('#container--users')
            .contains('td', testUserName)
            .should('exist');
    });
    it('Can delete a user', function () {
        // First, add a user to delete
        cy.get('#button--addUser').click();
        var testUserName = "deleteuser".concat(Date.now());
        cy.get('#userName').type(testUserName);
        cy.get('#form--addUser').submit();
        cy.wait(index_js_1.ajaxDelayMillis);
        // Find and click the delete button for this user
        cy.get('#container--users')
            .contains('tr', testUserName)
            .find('button[title*="Delete"]')
            .click();
        // Wait for confirmation modal
        cy.wait(200);
        // Confirm deletion
        cy.get('.modal.is-active')
            .contains('button', 'Delete User')
            .click();
        // Wait for AJAX response
        cy.wait(index_js_1.ajaxDelayMillis);
        // Verify the user is removed from the table
        cy.get('#container--users')
            .contains('td', testUserName)
            .should('not.exist');
    });
    it('Can toggle user permissions', function () {
        // Find the first user in the table and toggle a permission
        cy.get('#container--users')
            .find('button.permission-toggle')
            .first()
            .then(function ($button) {
            var initialClass = $button.hasClass('is-success') ? 'is-success' : 'is-light';
            // Click the button
            cy.wrap($button).click();
            // Wait for AJAX response
            cy.wait(index_js_1.ajaxDelayMillis);
            // Verify the button class changed
            cy.wrap($button).should('not.have.class', initialClass);
        });
    });
});
