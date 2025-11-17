import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:9000',
    projectId: '85uth8',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: false
  }
})
