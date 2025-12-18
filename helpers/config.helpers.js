var _a;
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Configurator } from '@cityssm/configurator';
import { secondsToMillis } from '@cityssm/to-millis';
import Debug from 'debug';
import { DEBUG_NAMESPACE } from '../debug.config.js';
import { configDefaultValues } from './config.defaults.js';
const debug = Debug(`${DEBUG_NAMESPACE}:config.helpers`);
/*
 * Parse command line arguments for --config parameter
 */
const configArgumentIndex = process.argv.indexOf('--config');
if (configArgumentIndex !== -1 &&
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    process.argv[configArgumentIndex + 1] !== undefined) {
    const configPath = process.argv[configArgumentIndex + 1];
    // Resolve relative paths from current working directory
    process.env.CONFIG_FILE = configPath.startsWith('/')
        ? configPath
        : path.resolve(process.cwd(), configPath);
}
// Load config from the path specified in CONFIG_FILE environment variable
// or default to data/config.js (resolved relative to this file)
const configPath = (_a = process.env.CONFIG_FILE) !== null && _a !== void 0 ? _a : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../data/config.js');
debug(`Loading configuration from: ${configPath}`);
// Convert absolute path to file URL for dynamic import (required for Windows compatibility)
const configUrl = pathToFileURL(configPath).href;
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, no-unsanitized/method
const { config } = await import(configUrl);
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
