import { testAdmin } from '../../../test/_globals.js';
import { ajaxDelayMillis, login, logout } from '../../support/index.js';
describe('Admin - Equipment Maintenance', () => {
    beforeEach('Loads page', () => {
        logout();
        login(testAdmin);
        cy.visit('/admin/equipment');
        cy.location('pathname').should('equal', '/admin/equipment');
    });
    afterEach(logout);
    it('Has no detectable accessibility issues', () => {
        cy.injectAxe();
        cy.checkA11y();
    });
    it.skip('Can add equipment', () => {
        cy.get('#button--addEquipment').click();
        cy.get('#modal--addEquipment').should('be.visible');
        const testEquipment = `Test Equipment ${Date.now()}`;
        cy.get('#addEquipment--equipmentName').type(testEquipment);
        cy.get('#form--addEquipment').submit();
        cy.wait(ajaxDelayMillis);
        cy.get('#container--equipment').contains(testEquipment).should('exist');
    });
    it.skip('Can update equipment', () => {
        cy.get('#container--equipment')
            .find('button[title*="Edit"]')
            .first()
            .click();
        cy.get('#modal--editEquipment').should('be.visible');
        const updatedText = ` - Updated ${Date.now()}`;
        cy.get('#editEquipment--equipmentName')
            .invoke('val')
            .then((originalValue) => {
            cy.get('#editEquipment--equipmentName')
                .clear()
                .type(originalValue + updatedText);
        });
        cy.get('#form--editEquipment').submit();
        cy.wait(ajaxDelayMillis);
        cy.get('#container--equipment').contains(updatedText).should('exist');
    });
    it.skip('Can delete equipment', () => {
        cy.get('#button--addEquipment').click();
        const testEquipment = `Delete Equipment ${Date.now()}`;
        cy.get('#addEquipment--equipmentName').type(testEquipment);
        cy.get('#form--addEquipment').submit();
        cy.wait(ajaxDelayMillis);
        cy.get('#container--equipment')
            .contains(testEquipment)
            .parents('.panel-block')
            .find('button[title*="Delete"]')
            .click();
        cy.wait(200);
        cy.get('.modal.is-active').contains('button', 'Delete Equipment').click();
        cy.wait(ajaxDelayMillis);
        cy.get('#container--equipment').contains(testEquipment).should('not.exist');
    });
});
