import { testUpdate } from '../../../test/_globals.js'
import { login, logout } from '../../support/index.js'

describe('Admin - Reports', () => {
  beforeEach('Loads page', () => {
    logout()
    login(testUpdate)
    cy.visit('/dashboard/reports')
    cy.location('pathname').should('equal', '/dashboard/reports')
  })

  afterEach(logout)

  it('Has no detectable accessibility issues', () => {
    cy.injectAxe()
    cy.checkA11y()
  })
})