import { testUpdate } from '../../../test/_globals.js'
import { login, logout } from '../../support/index.js'

describe('Admin - User Settings', () => {
  beforeEach('Loads page', () => {
    logout()
    login(testUpdate)
    cy.visit('/dashboard/userSettings')
    cy.location('pathname').should('equal', '/dashboard/userSettings')
  })

  afterEach(logout)

  it('Has no detectable accessibility issues', () => {
    cy.injectAxe()
    cy.checkA11y()
  })
})