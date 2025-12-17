"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.keepAliveMillis = void 0;
exports.getConfigProperty = getConfigProperty;
var node_path_1 = require("node:path");
var node_url_1 = require("node:url");
var configurator_1 = require("@cityssm/configurator");
var to_millis_1 = require("@cityssm/to-millis");
var debug_1 = require("debug");
var debug_config_js_1 = require("../debug.config.js");
var config_defaults_js_1 = require("./config.defaults.js");
var debug = (0, debug_1.default)("".concat(debug_config_js_1.DEBUG_NAMESPACE, ":config.helpers"));
/*
 * Parse command line arguments for --config parameter
 */
var configArgumentIndex = process.argv.indexOf('--config');
if (configArgumentIndex !== -1 &&
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    process.argv[configArgumentIndex + 1] !== undefined) {
    var configPath_1 = process.argv[configArgumentIndex + 1];
    // Resolve relative paths from current working directory
    process.env.CONFIG_FILE = configPath_1.startsWith('/')
        ? configPath_1
        : node_path_1.default.resolve(process.cwd(), configPath_1);
}
// Load config from the path specified in CONFIG_FILE environment variable
// or default to data/config.js (resolved relative to this file)
var configPath = (_a = process.env.CONFIG_FILE) !== null && _a !== void 0 ? _a : node_path_1.default.resolve(node_path_1.default.dirname((0, node_url_1.fileURLToPath)(import.meta.url)), '../data/config.js');
debug("Loading configuration from: ".concat(configPath));
// Convert absolute path to file URL for dynamic import (required for Windows compatibility)
var configUrl = (0, node_url_1.pathToFileURL)(configPath).href;
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, no-unsanitized/method
var config = (await Promise.resolve("".concat(configUrl)).then(function (s) { return require(s); })).config;
var configurator = new configurator_1.Configurator(config_defaults_js_1.configDefaultValues, config);
function getConfigProperty(propertyName, fallbackValue) {
    return configurator.getConfigProperty(propertyName, fallbackValue);
}
exports.default = {
    getConfigProperty: getConfigProperty
};
exports.keepAliveMillis = getConfigProperty('session.doKeepAlive')
    ? Math.max(getConfigProperty('session.maxAgeMillis') / 2, getConfigProperty('session.maxAgeMillis') - (0, to_millis_1.secondsToMillis)(10))
    : 0;
