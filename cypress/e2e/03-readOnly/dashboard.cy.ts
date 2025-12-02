import { testInquiry } from '../../../test/_globals.js'
import { login, logout } from '../../support/index.js'

describe('Dashboard', () => {
  beforeEach('Loads page', () => {
    logout()
    login(testInquiry)
    cy.visit('/dashboard')
    cy.location('pathname').should('equal', '/dashboard')
  })

  afterEach(logout)

  it('Has no detectable accessibility issues', () => {
    cy.injectAxe()
    cy.checkA11y()
  })
})