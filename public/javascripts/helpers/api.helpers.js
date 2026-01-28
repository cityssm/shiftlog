"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateApiKey = generateApiKey;
var node_crypto_1 = require("node:crypto");
function generateApiKey(apiKeyPrefix) {
    return "".concat(apiKeyPrefix, "-").concat((0, node_crypto_1.randomUUID)(), "-").concat(Date.now().toString());
}
