import { testAdmin } from '../../../test/_globals.js'
import { ajaxDelayMillis, login, logout } from '../../support/index.js'

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

  it('Can add an employee', () => {
    // Click the Add Employee button
    cy.get('#button--addEmployee').click()

    // Wait for modal to appear
    cy.get('#modal--addEmployee').should('be.visible')

    // Fill in the employee details
    const testEmployeeName = `Test Employee ${Date.now()}`
    cy.get('#addEmployee--employeeName').type(testEmployeeName)

    // Submit the form
    cy.get('#form--addEmployee').submit()

    // Wait for AJAX response
    cy.wait(ajaxDelayMillis)

    // Verify the employee appears in the container
    cy.get('#container--employees')
      .contains(testEmployeeName)
      .should('exist')
  })

  it('Can update an employee', () => {
    // Find the first edit button and click it
    cy.get('#container--employees')
      .find('button[title*="Edit"]')
      .first()
      .click()

    // Wait for modal to appear
    cy.get('#modal--editEmployee').should('be.visible')

    // Update the employee name
    const updatedText = ` - Updated ${Date.now()}`
    cy.get('#editEmployee--employeeName')
      .invoke('val')
      .then((originalValue) => {
        cy.get('#editEmployee--employeeName')
          .clear()
          .type(originalValue + updatedText)
      })

    // Submit the form
    cy.get('#form--editEmployee').submit()

    // Wait for AJAX response
    cy.wait(ajaxDelayMillis)

    // Verify the updated employee appears
    cy.get('#container--employees')
      .contains(updatedText)
      .should('exist')
  })

  it('Can delete an employee', () => {
    // First, add an employee to delete
    cy.get('#button--addEmployee').click()
    const testEmployeeName = `Delete Employee ${Date.now()}`
    cy.get('#addEmployee--employeeName').type(testEmployeeName)
    cy.get('#form--addEmployee').submit()
    cy.wait(ajaxDelayMillis)

    // Find and click the delete button
    cy.get('#container--employees')
      .contains(testEmployeeName)
      .parents('.panel-block')
      .find('button[title*="Delete"]')
      .click()

    // Wait for confirmation modal
    cy.wait(200)

    // Confirm deletion
    cy.get('.modal.is-active')
      .contains('button', 'Delete Employee')
      .click()

    // Wait for AJAX response
    cy.wait(ajaxDelayMillis)

    // Verify the employee is removed
    cy.get('#container--employees')
      .contains(testEmployeeName)
      .should('not.exist')
  })
})