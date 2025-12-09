import { testAdmin } from '../../../test/_globals.js';
import { ajaxDelayMillis, login, logout } from '../../support/index.js';
describe('Admin - Employee Management', () => {
    beforeEach('Loads page', () => {
        logout();
        login(testAdmin);
        cy.visit('/admin/employees');
        cy.location('pathname').should('equal', '/admin/employees');
    });
    afterEach(logout);
    it('Has no detectable accessibility issues', () => {
        cy.injectAxe();
        cy.checkA11y();
    });
    it('Can add an employee', () => {
        // Click the Add Employee button
        cy.get('#button--addEmployee').click();
        // Wait for modal to appear
        cy.get('#modal--addEmployee').should('be.visible');
        // Fill in the employee details
        const testEmployeeNumber = Date.now().toString();
        const testEmployeeFirstName = `Test First ${testEmployeeNumber}`;
        const testEmployeeLastName = `Test Last ${testEmployeeNumber}`;
        cy.get('#addEmployee--employeeNumber').type(testEmployeeNumber);
        cy.get('#addEmployee--firstName').type(testEmployeeFirstName);
        cy.get('#addEmployee--lastName').type(testEmployeeLastName);
        // Submit the form
        cy.get('#form--addEmployee').submit();
        // Wait for AJAX response
        cy.wait(ajaxDelayMillis);
        // Verify the employee appears in the container
        cy.get('#container--employees')
            .contains(testEmployeeNumber)
            .should('exist');
    });
    it('Can update an employee', () => {
        // Find the first edit button and click it
        cy.get('#container--employees')
            .find('button[title*="Edit"]')
            .first()
            .click();
        // Wait for modal to appear
        cy.get('#modal--editEmployee').should('be.visible');
        // Update the employee name
        const updatedText = ` - Updated ${Date.now()}`;
        cy.get('#editEmployee--lastName')
            .invoke('val')
            .then((originalValue) => {
            cy.get('#editEmployee--lastName')
                .clear()
                .type(originalValue + updatedText);
        });
        // Submit the form
        cy.get('#form--editEmployee').submit();
        // Wait for AJAX response
        cy.wait(ajaxDelayMillis);
        // Verify the updated employee appears
        cy.get('#container--employees')
            .contains(updatedText)
            .should('exist');
    });
    it('Can delete an employee', () => {
        // First, add an employee to delete
        cy.get('#button--addEmployee').click();
        const testEmployeeNumber = Date.now().toString();
        const testEmployeeFirstName = `Delete First ${testEmployeeNumber}`;
        const testEmployeeLastName = `Delete Last ${testEmployeeNumber}`;
        cy.get('#addEmployee--employeeNumber').type(testEmployeeNumber);
        cy.get('#addEmployee--firstName').type(testEmployeeFirstName);
        cy.get('#addEmployee--lastName').type(testEmployeeLastName);
        cy.get('#form--addEmployee').submit();
        cy.wait(ajaxDelayMillis);
        cy.get('.modal button[data-cy="ok"]').click();
        // Find and click the delete button
        cy.get('#container--employees')
            .contains(testEmployeeNumber)
            .parents('tr')
            .find('button[title*="Delete"]')
            .click();
        // Wait for confirmation modal
        cy.wait(200);
        // Confirm deletion
        cy.get('.modal.is-active')
            .contains('button', 'Delete Employee')
            .click();
        // Wait for AJAX response
        cy.wait(ajaxDelayMillis);
        // Verify the employee is removed
        cy.get('#container--employees')
            .contains(testEmployeeNumber)
            .should('not.exist');
    });
});
