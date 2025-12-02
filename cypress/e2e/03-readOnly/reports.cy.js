import { testInquiry } from '../../../test/_globals.js';
import { login, logout } from '../../support/index.js';
describe('Reports', () => {
    beforeEach('Loads page', () => {
        logout();
        login(testInquiry);
        cy.visit('/dashboard/reports');
        cy.location('pathname').should('equal', '/dashboard/reports');
    });
    afterEach(logout);
    it('Has no detectable accessibility issues', () => {
        cy.injectAxe();
        cy.checkA11y();
    });
});
