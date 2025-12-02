import { testAdmin } from '../../../test/_globals.js'
import { login, logout } from '../../support/index.js'

describe('Admin - Employee Management', () => {
  beforeEach('Loads page', () => {
    logout()
    login(testAdmin)
    cy.visit('/admin/employees')
    cy.location('pathname').should('equal', '/admin/employees')
  })

  afterEach(logout)

  it('Has no detectable accessibility issues', () => {
    cy.injectAxe()
    cy.checkA11y()
  })
})