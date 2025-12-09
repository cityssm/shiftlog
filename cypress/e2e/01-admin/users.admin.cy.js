import { testAdmin } from '../../../test/_globals.js';
import { ajaxDelayMillis, login, logout } from '../../support/index.js';
describe('Admin - User Management', () => {
    beforeEach('Loads page', () => {
        logout();
        login(testAdmin);
        cy.visit('/admin/users');
        cy.location('pathname').should('equal', '/admin/users');
    });
    afterEach(logout);
    it('Has no detectable accessibility issues', () => {
        cy.injectAxe();
        cy.checkA11y();
    });
    it('Can add a user', () => {
        // Click the Add User button
        cy.get('#button--addUser').click();
        // Wait for modal to appear
        cy.get('#modal--addUser').should('be.visible');
        // Fill in the username
        const testUserName = `testuser${Date.now()}`;
        cy.get('#userName').type(testUserName);
        // Submit the form
        cy.get('#form--addUser').submit();
        // Wait for AJAX response
        cy.wait(ajaxDelayMillis);
        // Verify the user appears in the table
        cy.get('#container--users')
            .contains('td', testUserName)
            .should('exist');
    });
    it('Can delete a user', () => {
        // First, add a user to delete
        cy.get('#button--addUser').click();
        const testUserName = `deleteuser${Date.now()}`;
        cy.get('#userName').type(testUserName);
        cy.get('#form--addUser').submit();
        cy.wait(ajaxDelayMillis);
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
        cy.wait(ajaxDelayMillis);
        // Verify the user is removed from the table
        cy.get('#container--users')
            .contains('td', testUserName)
            .should('not.exist');
    });
    it('Can toggle user permissions', () => {
        // Find the first user in the table and toggle a permission
        cy.get('#container--users')
            .find('button.permission-toggle')
            .first()
            .then(($button) => {
            const initialClass = $button.hasClass('is-success') ? 'is-success' : 'is-light';
            // Click the button
            cy.wrap($button).click();
            // Wait for AJAX response
            cy.wait(ajaxDelayMillis);
            // Verify the button class changed
            cy.wrap($button).should('not.have.class', initialClass);
        });
    });
});
