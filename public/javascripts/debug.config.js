"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROCESS_ID_MAX_DIGITS = exports.DEBUG_ENABLE_NAMESPACES = exports.DEBUG_NAMESPACE = void 0;
var debug_1 = require("@cityssm/avanti-api/debug");
var debug_2 = require("@cityssm/mssql-multi-pool/debug");
var debug_3 = require("@cityssm/scheduled-task/debug");
var debug_4 = require("@cityssm/worktech-api/debug");
exports.DEBUG_NAMESPACE = 'shiftlog';
exports.DEBUG_ENABLE_NAMESPACES = [
    "".concat(exports.DEBUG_NAMESPACE, ":*"),
    debug_1.DEBUG_ENABLE_NAMESPACES,
    debug_2.DEBUG_ENABLE_NAMESPACES,
    debug_3.DEBUG_ENABLE_NAMESPACES,
    debug_4.DEBUG_ENABLE_NAMESPACES
].join(',');
exports.PROCESS_ID_MAX_DIGITS = 5;
