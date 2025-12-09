import { testAdmin } from '../../../test/_globals.js'
import { ajaxDelayMillis, login, logout } from '../../support/index.js'

describe('Admin - Data List Management', () => {
  beforeEach('Loads page', () => {
    logout()
    login(testAdmin)
    cy.visit('/admin/dataLists')
    cy.location('pathname').should('equal', '/admin/dataLists')
  })

  afterEach(logout)

  it('Has no detectable accessibility issues', () => {
    cy.injectAxe()
    cy.checkA11y()
  })

  it('Can add a data list item', () => {
    // Click the first Add Item button
    cy.get('.button--addItem').first().click()

    // Wait for modal to appear
    cy.get('.modal.is-active').should('be.visible')

    // Fill in the item details
    const testItemName = `Test Item ${Date.now()}`
    cy.get('input[name="dataListItem"]').type(testItemName)

    // Submit the form
    cy.get('.modal.is-active form').submit()

    // Wait for AJAX response
    cy.wait(ajaxDelayMillis)

    // Verify the item appears
    cy.contains(testItemName).should('exist')
  })

  it('Can update a data list item', () => {
    // Find the first edit button and click it
    cy.get('button[title*="Edit"]').first().click()

    // Wait for modal to appear
    cy.get('.modal.is-active').should('be.visible')

    // Update the item
    const updatedText = ` - Updated ${Date.now()}`
    cy.get('input[name="dataListItem"]')
      .invoke('val')
      .then((originalValue) => {
        cy.get('input[name="dataListItem"]')
          .clear()
          .type(originalValue + updatedText)
      })

    // Submit the form
    cy.get('.modal.is-active form').submit()

    // Wait for AJAX response
    cy.wait(ajaxDelayMillis)

    // Verify the updated item appears
    cy.contains(updatedText).should('exist')
  })

  it('Can delete a data list item', () => {
    // First, add an item to delete
    cy.get('.button--addItem').first().click()
    const testItemName = `Delete Item ${Date.now()}`
    cy.get('input[name="dataListItem"]').type(testItemName)
    cy.get('.modal.is-active form').submit()
    cy.wait(ajaxDelayMillis)

    // Find and click the delete button for this item
    cy.contains(testItemName)
      .parents('tr')
      .find('button[title*="Delete"]')
      .click()

    // Wait for confirmation modal
    cy.wait(200)

    // Confirm deletion
    cy.get('.modal.is-active')
      .contains('button', 'Delete')
      .click()

    // Wait for AJAX response
    cy.wait(ajaxDelayMillis)

    // Verify the item is removed
    cy.contains(testItemName).should('not.exist')
  })
})