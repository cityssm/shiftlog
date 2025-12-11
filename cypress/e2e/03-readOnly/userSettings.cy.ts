import { testInquiry } from '../../../test/_globals.js'
import { login, logout } from '../../support/index.js'

describe('User Settings', () => {
  beforeEach('Loads page', () => {
    logout()
    login(testInquiry)
    cy.visit('/dashboard/userSettings')
    cy.location('pathname').should('equal', '/dashboard/userSettings')
  })

  afterEach(logout)

  it('Has no detectable accessibility issues', () => {
    cy.injectAxe()
    cy.checkA11y()
  })

  it('Has an employee contact form if employee record is available', () => {
    // Check if the employee contact form exists
    cy.get('body').then(($body) => {
      if ($body.find('#employeeContactForm').length > 0) {
        cy.get('#employeeContactForm').should('be.visible')
        cy.get('#employeeContactForm--phoneNumber').should('exist')
        cy.get('#employeeContactForm--phoneNumberAlternate').should('exist')
        cy.get('#employeeContactForm--emailAddress').should('exist')
      }
    })
  })
})
