"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pdfGenerationDelayMillis = exports.pageLoadDelayMillis = exports.ajaxDelayMillis = exports.login = exports.logout = void 0;
exports.checkA11yLog = checkA11yLog;
require("cypress-axe");
var logout = function () {
    cy.visit('/logout');
};
exports.logout = logout;
var login = function (userName) {
    cy.visit('/login');
    /*
    cy.get('.message').contains('Testing', {
      matchCase: false
    })
    */
    cy.get("form [name='userName']").type(userName);
    cy.get("form [name='password']").type(userName);
    cy.get('form').submit();
    cy.location('pathname').should('not.contain', '/login');
    // Logged in pages have a navbar
    cy.get('.navbar').should('have.length', 1);
};
exports.login = login;
exports.ajaxDelayMillis = 800;
exports.pageLoadDelayMillis = 1200;
exports.pdfGenerationDelayMillis = 10000;
function checkA11yLog(violations) {
    if (violations.length > 0) {
        cy.log('Accessibility violations found:');
        for (var _i = 0, violations_1 = violations; _i < violations_1.length; _i++) {
            var violation = violations_1[_i];
            cy.log("- ".concat(violation.id, ": ").concat(violation.description));
            cy.log("  Context: ".concat(JSON.stringify(violation.nodes)));
        }
    }
}
