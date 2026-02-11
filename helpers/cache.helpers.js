import cluster from 'node:cluster';
import Debug from 'debug';
import { DEBUG_NAMESPACE, PROCESS_ID_MAX_DIGITS } from '../debug.config.js';
import { clearApiKeysCache, getCachedApiKeys } from './cache/apiKeys.cache.js';
import { clearSettingsCache } from './cache/settings.cache.js';
const debug = Debug(`${DEBUG_NAMESPACE}:helpers.cache:${process.pid.toString().padEnd(PROCESS_ID_MAX_DIGITS)}`);
/*
 * Cache Management
 */
export function preloadCaches() {
    debug('Preloading caches');
    void getCachedApiKeys();
    debug('Caches preloaded');
}
export const cacheTableNames = ['ApplicationSettings', 'UserSettings'];
export function clearCacheByTableName(tableName, relayMessage = true) {
    switch (tableName) {
        case 'ApplicationSettings': {
            clearSettingsCache();
            break;
        }
        case 'UserSettings': {
            clearApiKeysCache();
            break;
        }
        // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
        default: {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            debug(`No cache clearing action for table: ${tableName}`);
            return;
        }
    }
    try {
        if (relayMessage && cluster.isWorker) {
            const workerMessage = {
                messageType: 'clearCache',
                tableName,
                sourcePid: process.pid,
                sourceTimeMillis: Date.now(),
                targetProcesses: 'workers'
            };
            debug(`Sending clear cache from worker: ${tableName}`);
            if (process.send !== undefined) {
                process.send(workerMessage);
            }
        }
    }
    catch {
        // ignore
    }
}
export function clearCaches() {
    clearApiKeysCache();
    debug('Caches cleared');
}
process.on('message', (message) => {
    if (message.messageType === 'clearCache' &&
        message.sourcePid !== process.pid) {
        debug(`Clearing cache: ${message.tableName}`);
        clearCacheByTableName(message.tableName, false);
    }
});
