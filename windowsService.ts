import path from 'node:path'

import type { ServiceConfig } from 'node-windows'

import { getConfigProperty } from './helpers/config.helpers.js'

const _dirname = '.'

/**
 * Get the Windows service configuration
 * @param configFilePath - Optional path to the config file (defaults to data/config.js)
 * @returns ServiceConfig object for node-windows
 */
export function getServiceConfig(configFilePath?: string): ServiceConfig {
  const config: ServiceConfig = {
    name: `ShiftLog (${getConfigProperty('application.instance')})`,

    description:
      'A work management system with work order recording, shift activity logging, and timesheet tracking.',
      
    script: path.join(_dirname, 'index.js')
  }

  if (configFilePath !== undefined && configFilePath !== '') {
    config.env = {
      name: 'CONFIG_FILE',
      value: configFilePath
    }
  }

  return config
}

// Maintain backward compatibility with default export
export const serviceConfig: ServiceConfig = getServiceConfig()
