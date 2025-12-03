/* eslint-disable no-console, unicorn/filename-case, @eslint-community/eslint-comments/disable-enable-pair */

import { Service } from 'node-windows'

import { getServiceConfig } from './windowsService.js'

/*
 * Parse command line arguments for --config parameter
 */
const configArgIndex = process.argv.indexOf('--config')
const configFilePath = configArgIndex !== -1 && process.argv[configArgIndex + 1] !== undefined
  ? process.argv[configArgIndex + 1]
  : undefined

// Create a new service object
const svc = new Service(getServiceConfig(configFilePath))

// Listen for the "uninstall" event so we know when it's done.
svc.on('uninstall', () => {
  console.log('Uninstall complete.')
  console.log('The service exists:', svc.exists)
})

// Uninstall the service.
svc.uninstall()
