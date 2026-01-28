"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheTableNames = void 0;
exports.preloadCaches = preloadCaches;
exports.clearCacheByTableName = clearCacheByTableName;
exports.clearCaches = clearCaches;
var node_cluster_1 = require("node:cluster");
var debug_1 = require("debug");
var debug_config_js_1 = require("../debug.config.js");
var apiKeys_cache_js_1 = require("./cache/apiKeys.cache.js");
var settings_cache_js_1 = require("./cache/settings.cache.js");
var debug = (0, debug_1.default)("".concat(debug_config_js_1.DEBUG_NAMESPACE, ":helpers.cache:").concat(process.pid.toString().padEnd(debug_config_js_1.PROCESS_ID_MAX_DIGITS)));
/*
 * Cache Management
 */
function preloadCaches() {
    debug('Preloading caches');
    void (0, apiKeys_cache_js_1.getCachedApiKeys)();
    debug('Caches preloaded');
}
exports.cacheTableNames = ['ApplicationSettings', 'UserSettings'];
function clearCacheByTableName(tableName, relayMessage) {
    if (relayMessage === void 0) { relayMessage = true; }
    switch (tableName) {
        case 'ApplicationSettings': {
            (0, settings_cache_js_1.clearSettingsCache)();
            break;
        }
        case 'UserSettings': {
            (0, apiKeys_cache_js_1.clearApiKeysCache)();
            break;
        }
        // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
        default: {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            debug("No cache clearing action for table: ".concat(tableName));
            return;
        }
    }
    try {
        if (relayMessage && node_cluster_1.default.isWorker) {
            var workerMessage = {
                messageType: 'clearCache',
                tableName: tableName,
                sourcePid: process.pid,
                sourceTimeMillis: Date.now(),
                targetProcesses: 'workers'
            };
            debug("Sending clear cache from worker: ".concat(tableName));
            if (process.send !== undefined) {
                process.send(workerMessage);
            }
        }
    }
    catch (_a) {
        // ignore
    }
}
function clearCaches() {
    (0, apiKeys_cache_js_1.clearApiKeysCache)();
    debug('Caches cleared');
}
process.on('message', function (message) {
    if (message.messageType === 'clearCache' && message.sourcePid !== process.pid) {
        debug("Clearing cache: ".concat(message.tableName));
        clearCacheByTableName(message.tableName, false);
    }
});
