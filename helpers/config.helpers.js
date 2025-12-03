import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Configurator } from '@cityssm/configurator';
import { secondsToMillis } from '@cityssm/to-millis';
import { configDefaultValues } from './config.defaults.js';
// Load config from the path specified in CONFIG_FILE environment variable
// or default to data/config.js (resolved relative to this file)
const configPath = process.env.CONFIG_FILE ??
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../data/config.js');
const { config } = await import(configPath);
const configurator = new Configurator(configDefaultValues, config);
export function getConfigProperty(propertyName, fallbackValue) {
    return configurator.getConfigProperty(propertyName, fallbackValue);
}
export default {
    getConfigProperty
};
export const keepAliveMillis = getConfigProperty('session.doKeepAlive')
    ? Math.max(getConfigProperty('session.maxAgeMillis') / 2, getConfigProperty('session.maxAgeMillis') - secondsToMillis(10))
    : 0;
