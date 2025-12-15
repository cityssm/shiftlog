"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
var config_helpers_js_1 = require("../../helpers/config.helpers.js");
function handler(request, response) {
    var _a;
    response.render('shifts/recovery', {
        headTitle: "".concat((0, config_helpers_js_1.getConfigProperty)('shifts.sectionName'), " - Record Recovery"),
        error: (_a = request.query.error) !== null && _a !== void 0 ? _a : ''
    });
}
