import { testUpdate } from '../../../test/_globals.js'
import { login, logout } from '../../support/index.js'

describe('Admin - Dashboard', () => {
  beforeEach('Loads page', () => {
    logout()
    login(testUpdate)
    cy.visit('/dashboard')
    cy.location('pathname').should('equal', '/dashboard')
  })

  afterEach(logout)

  it('Has no detectable accessibility issues', () => {
    cy.injectAxe()
    cy.checkA11y()
  })
})