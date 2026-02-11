import { testAdmin } from '../../../test/_globals.js'
import { login, logout } from '../../support/index.js'

describe('Admin - Work Order Type Maintenance', () => {
  beforeEach('Loads page', () => {
    logout()
    login(testAdmin)
    cy.visit('/admin/workOrderTypes')
    cy.location('pathname').should('equal', '/admin/workOrderTypes')
  })

  afterEach(logout)

  it('Has no detectable accessibility issues', () => {
    cy.injectAxe()
    cy.checkA11y()
  })
})
