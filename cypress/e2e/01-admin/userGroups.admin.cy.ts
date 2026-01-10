import { testAdmin } from '../../../test/_globals.js'
import { ajaxDelayMillis, login, logout } from '../../support/index.js'

describe('Admin - User Group Management', () => {
  beforeEach('Loads page', () => {
    logout()
    login(testAdmin)
    cy.visit('/admin/userGroups')
    cy.location('pathname').should('equal', '/admin/userGroups')
  })

  afterEach(logout)

  it('Has no detectable accessibility issues', () => {
    cy.injectAxe()
    cy.checkA11y()
  })

  it('Can add a user group', () => {
    // Click the Add User Group button
    cy.get('#button--addUserGroup').click()

    // Wait for modal to appear
    cy.get('#modal--addUserGroup').should('be.visible')

    // Fill in the user group details
    const testGroupName = `Test Group ${Date.now()}`
    cy.get('#addUserGroup--groupName').type(testGroupName)

    // Submit the form
    cy.get('#form--addUserGroup').submit()

    // Wait for AJAX response
    cy.wait(ajaxDelayMillis)

    // Verify the user group appears in the container
    cy.get('#container--userGroups')
      .contains(testGroupName)
      .should('exist')
  })

  it('Can update a user group', () => {
    // Find the first edit button and click it
    cy.get('#container--userGroups')
      .find('button[title*="Edit"]')
      .first()
      .click()

    // Wait for modal to appear
    cy.get('#modal--editUserGroup').should('be.visible')

    // Update the group name
    const updatedText = ` - Updated ${Date.now()}`
    cy.get('#editUserGroup--groupName')
      .invoke('val')
      .then((originalValue) => {
        cy.get('#editUserGroup--groupName')
          .clear()
          .type(originalValue + updatedText)
      })

    // Submit the form
    cy.get('#form--editUserGroup').submit()

    // Wait for AJAX response
    cy.wait(ajaxDelayMillis)

    // Verify the updated group appears
    cy.get('#container--userGroups')
      .contains(updatedText)
      .should('exist')
  })

  it('Can delete a user group', () => {
    // First, add a user group to delete
    cy.get('#button--addUserGroup').click()
    const testGroupName = `Delete Group ${Date.now()}`
    cy.get('#addUserGroup--groupName').type(testGroupName)
    cy.get('#form--addUserGroup').submit()
    cy.wait(ajaxDelayMillis)

    // Find and click the delete button
    cy.get('#container--userGroups')
      .contains(testGroupName)
      .parents('.panel-block')
      .find('button[title*="Delete"]')
      .click()

    // Wait for confirmation modal
    cy.wait(200)

    // Confirm deletion
    cy.get('.modal.is-active')
      .contains('button', 'Delete Group')
      .click()

    // Wait for AJAX response
    cy.wait(ajaxDelayMillis)

    // Verify the group is removed
    cy.get('#container--userGroups')
      .contains(testGroupName)
      .should('not.exist')
  })
})