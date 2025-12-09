"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _globals_js_1 = require("../../../test/_globals.js");
var index_js_1 = require("../../support/index.js");
describe('Admin - Employee Management', function () {
    beforeEach('Loads page', function () {
        (0, index_js_1.logout)();
        (0, index_js_1.login)(_globals_js_1.testAdmin);
        cy.visit('/admin/employees');
        cy.location('pathname').should('equal', '/admin/employees');
    });
    afterEach(index_js_1.logout);
    it('Has no detectable accessibility issues', function () {
        cy.injectAxe();
        cy.checkA11y();
    });
    it('Can add an employee', function () {
        // Click the Add Employee button
        cy.get('#button--addEmployee').click();
        // Wait for modal to appear
        cy.get('#modal--addEmployee').should('be.visible');
        // Fill in the employee details
        var testEmployeeName = "Test Employee ".concat(Date.now());
        cy.get('#addEmployee--employeeName').type(testEmployeeName);
        // Submit the form
        cy.get('#form--addEmployee').submit();
        // Wait for AJAX response
        cy.wait(index_js_1.ajaxDelayMillis);
        // Verify the employee appears in the container
        cy.get('#container--employees')
            .contains(testEmployeeName)
            .should('exist');
    });
    it('Can update an employee', function () {
        // Find the first edit button and click it
        cy.get('#container--employees')
            .find('button[title*="Edit"]')
            .first()
            .click();
        // Wait for modal to appear
        cy.get('#modal--editEmployee').should('be.visible');
        // Update the employee name
        var updatedText = " - Updated ".concat(Date.now());
        cy.get('#editEmployee--employeeName')
            .invoke('val')
            .then(function (originalValue) {
            cy.get('#editEmployee--employeeName')
                .clear()
                .type(originalValue + updatedText);
        });
        // Submit the form
        cy.get('#form--editEmployee').submit();
        // Wait for AJAX response
        cy.wait(index_js_1.ajaxDelayMillis);
        // Verify the updated employee appears
        cy.get('#container--employees')
            .contains(updatedText)
            .should('exist');
    });
    it('Can delete an employee', function () {
        // First, add an employee to delete
        cy.get('#button--addEmployee').click();
        var testEmployeeName = "Delete Employee ".concat(Date.now());
        cy.get('#addEmployee--employeeName').type(testEmployeeName);
        cy.get('#form--addEmployee').submit();
        cy.wait(index_js_1.ajaxDelayMillis);
        // Find and click the delete button
        cy.get('#container--employees')
            .contains(testEmployeeName)
            .parents('.panel-block')
            .find('button[title*="Delete"]')
            .click();
        // Wait for confirmation modal
        cy.wait(200);
        // Confirm deletion
        cy.get('.modal.is-active')
            .contains('button', 'Delete Employee')
            .click();
        // Wait for AJAX response
        cy.wait(index_js_1.ajaxDelayMillis);
        // Verify the employee is removed
        cy.get('#container--employees')
            .contains(testEmployeeName)
            .should('not.exist');
    });
});
