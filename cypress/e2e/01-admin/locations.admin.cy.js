import { testAdmin } from '../../../test/_globals.js';
import { login, logout } from '../../support/index.js';
describe('Admin - Location Maintenance', () => {
    beforeEach('Loads page', () => {
        logout();
        login(testAdmin);
        cy.visit('/admin/locations');
        cy.location('pathname').should('equal', '/admin/locations');
    });
    afterEach(logout);
    it('Has no detectable accessibility issues', () => {
        cy.injectAxe();
        cy.checkA11y();
    });
});
