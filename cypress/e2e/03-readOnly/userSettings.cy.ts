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
})
