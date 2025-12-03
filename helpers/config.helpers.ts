import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { Configurator } from '@cityssm/configurator'
import { secondsToMillis } from '@cityssm/to-millis'

import { configDefaultValues } from './config.defaults.js'

// Load config from the path specified in CONFIG_FILE environment variable
// or default to data/config.js (resolved relative to this file)
const configPath =
  process.env.CONFIG_FILE ??
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../data/config.js')

const { config } = await import(configPath)

const configurator = new Configurator(
  configDefaultValues,
  config as unknown as Record<string, unknown>
)

export function getConfigProperty<K extends keyof typeof configDefaultValues>(
  propertyName: K,
  fallbackValue?: (typeof configDefaultValues)[K]
): (typeof configDefaultValues)[K] {
  return configurator.getConfigProperty(
    propertyName,
    fallbackValue
  ) as (typeof configDefaultValues)[K]
}

export default {
  getConfigProperty
}

export const keepAliveMillis = getConfigProperty('session.doKeepAlive')
  ? Math.max(
      getConfigProperty('session.maxAgeMillis') / 2,
      getConfigProperty('session.maxAgeMillis') - secondsToMillis(10)
    )
  : 0
