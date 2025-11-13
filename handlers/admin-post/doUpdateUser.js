"use strict";
// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/naming-convention */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
var updateUser_js_1 = require("../../database/users/updateUser.js");
function handler(request, response) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, userName, _b, isActive, _c, shifts_canView, _d, shifts_canUpdate, _e, shifts_canManage, _f, workOrders_canView, _g, workOrders_canUpdate, _h, workOrders_canManage, _j, timesheets_canView, _k, timesheets_canUpdate, _l, timesheets_canManage, _m, isAdmin, success, error_1;
        return __generator(this, function (_o) {
            switch (_o.label) {
                case 0:
                    _a = request.body, userName = _a.userName, _b = _a.isActive, isActive = _b === void 0 ? '0' : _b, _c = _a.shifts_canView, shifts_canView = _c === void 0 ? '0' : _c, _d = _a.shifts_canUpdate, shifts_canUpdate = _d === void 0 ? '0' : _d, _e = _a.shifts_canManage, shifts_canManage = _e === void 0 ? '0' : _e, _f = _a.workOrders_canView, workOrders_canView = _f === void 0 ? '0' : _f, _g = _a.workOrders_canUpdate, workOrders_canUpdate = _g === void 0 ? '0' : _g, _h = _a.workOrders_canManage, workOrders_canManage = _h === void 0 ? '0' : _h, _j = _a.timesheets_canView, timesheets_canView = _j === void 0 ? '0' : _j, _k = _a.timesheets_canUpdate, timesheets_canUpdate = _k === void 0 ? '0' : _k, _l = _a.timesheets_canManage, timesheets_canManage = _l === void 0 ? '0' : _l, _m = _a.isAdmin, isAdmin = _m === void 0 ? '0' : _m;
                    _o.label = 1;
                case 1:
                    _o.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, updateUser_js_1.default)({
                            userName: userName,
                            isActive: isActive === '1',
                            shifts_canView: shifts_canView === '1',
                            shifts_canUpdate: shifts_canUpdate === '1',
                            shifts_canManage: shifts_canManage === '1',
                            workOrders_canView: workOrders_canView === '1',
                            workOrders_canUpdate: workOrders_canUpdate === '1',
                            workOrders_canManage: workOrders_canManage === '1',
                            timesheets_canView: timesheets_canView === '1',
                            timesheets_canUpdate: timesheets_canUpdate === '1',
                            timesheets_canManage: timesheets_canManage === '1',
                            isAdmin: isAdmin === '1'
                        }, request.session.user)];
                case 2:
                    success = _o.sent();
                    if (success) {
                        response.json({
                            message: 'User updated successfully',
                            success: true
                        });
                    }
                    else {
                        response.status(404).json({
                            message: 'User not found',
                            success: false
                        });
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _o.sent();
                    response.status(500).json({
                        message: error_1 instanceof Error ? error_1.message : 'Failed to update user',
                        success: false
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
