import { testAdmin } from '../../../test/_globals.js'
import { ajaxDelayMillis, login, logout } from '../../support/index.js'

describe('Admin - Application Settings', () => {
  beforeEach('Loads page', () => {
    logout()
    login(testAdmin)
    cy.visit('/admin/settings')
    cy.location('pathname').should('equal', '/admin/settings')
  })

  afterEach(logout)

  it('Has no detectable accessibility issues', () => {
    cy.injectAxe()
    cy.checkA11y()
  })

  it('Can update a setting', () => {
    // Find the first editable setting (text input)
    cy.get('.settingForm')
      .has('input.input[type="text"]')
      .first()
      .within(() => {
        // Get the current value
        cy.get('input.input[type="text"]')
          .invoke('val')
          .then((originalValue) => {
            // Change the value
            const newValue = `${originalValue}-test`
            cy.get('input.input[type="text"]').clear().type(newValue)

            // Submit the form
            cy.get('form').submit()

            // Wait for AJAX response
            cy.wait(ajaxDelayMillis)

            // Verify success (the warning background should be removed)
            cy.get('input.input[type="text"]').should(
              'not.have.class',
              'has-background-warning-light'
            )

            // Restore the original value
            cy.get('input.input[type="text"]').clear().type(originalValue.toString())
            cy.get('form').submit()
            cy.wait(ajaxDelayMillis)
          })
      })
  })

  it('Highlights changed settings', () => {
    // Find the first text input setting
    cy.get('.settingForm input.input[type="text"]').first().as('settingInput')

    // Change the value
    cy.get('@settingInput').type('-changed')

    // Verify the input has the warning background
    cy.get('@settingInput').should('have.class', 'has-background-warning-light')
  })

  it('Can filter settings', () => {
    // Type in the filter
    cy.get('#settingsFilter').type('application')

    // Wait a moment for the filter to apply
    cy.wait(200)

    // Verify some rows are hidden
    cy.get('#settingsTableBody tr.is-hidden').should('exist')

    // Clear the filter
    cy.get('#settingsFilter').clear()

    // Wait a moment
    cy.wait(200)

    // Verify all rows are visible
    cy.get('#settingsTableBody tr').should('not.have.class', 'is-hidden')
  })
})