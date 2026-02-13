import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Configurator } from '@cityssm/configurator';
import { secondsToMillis } from '@cityssm/to-millis';
import Debug from 'debug';
import { DEBUG_NAMESPACE } from '../debug.config.js';
import { configDefaultValues } from './config.defaults.js';
const debug = Debug(`${DEBUG_NAMESPACE}:config.helpers`);
const configArgumentIndex = process.argv.indexOf('--config');
if (configArgumentIndex !== -1 &&
    process.argv[configArgumentIndex + 1] !== undefined) {
    const configPath = process.argv[configArgumentIndex + 1];
    process.env.CONFIG_FILE = configPath.startsWith('/')
        ? configPath
        : path.resolve(process.cwd(), configPath);
}
const configPath = process.env.CONFIG_FILE ??
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../data/config.js');
debug(`Loading configuration from: ${configPath}`);
const configUrl = pathToFileURL(configPath).href;
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
