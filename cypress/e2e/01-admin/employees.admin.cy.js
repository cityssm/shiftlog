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
        cy.get('#button--addEmployee').click();
        cy.get('#modal--addEmployee').should('be.visible');
        const testEmployeeNumber = Date.now().toString();
        const testEmployeeFirstName = `Test First ${testEmployeeNumber}`;
        const testEmployeeLastName = `Test Last ${testEmployeeNumber}`;
        cy.get('#addEmployee--employeeNumber').type(testEmployeeNumber);
        cy.get('#addEmployee--firstName').type(testEmployeeFirstName);
        cy.get('#addEmployee--lastName').type(testEmployeeLastName);
        cy.get('#form--addEmployee').submit();
        cy.wait(ajaxDelayMillis);
        cy.get('#container--employees').contains(testEmployeeNumber).should('exist');
    });
    it('Can update an employee', () => {
        cy.get('#container--employees')
            .find('button[title*="Edit"]')
            .first()
            .click();
        cy.get('#modal--editEmployee').should('be.visible');
        const updatedText = ` - Updated ${Date.now()}`;
        cy.get('#editEmployee--lastName')
            .invoke('val')
            .then((originalValue) => {
            const newValue = (originalValue + updatedText).slice(-50);
            cy.get('#editEmployee--lastName').clear().type(newValue);
        });
        cy.get('#form--editEmployee').submit();
        cy.wait(ajaxDelayMillis);
        cy.get('#container--employees').contains(updatedText).should('exist');
    });
    it('Can delete an employee', () => {
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
        cy.get('#container--employees')
            .contains(testEmployeeNumber)
            .parents('tr')
            .find('button[title*="Delete"]')
            .click({ force: true });
        cy.wait(200);
        cy.get('.modal.is-active').contains('button', 'Delete Employee').click();
        cy.wait(ajaxDelayMillis);
        cy.get('#container--employees')
            .contains(testEmployeeNumber)
            .should('not.exist');
    });
});
