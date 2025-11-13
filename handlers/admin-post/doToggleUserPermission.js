"use strict";
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
var getUsers_js_1 = require("../../database/users/getUsers.js");
var updateUser_js_1 = require("../../database/users/updateUser.js");
function handler(request, response) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, userName, permissionField, validPermissions, users, currentUser, updateForm, success, updatedUsers, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = request.body, userName = _a.userName, permissionField = _a.permissionField;
                    if (!userName || !permissionField) {
                        response.status(400).json({
                            success: false,
                            message: 'User name and permission field are required'
                        });
                        return [2 /*return*/];
                    }
                    validPermissions = [
                        'isActive',
                        'shifts_canView',
                        'shifts_canUpdate',
                        'shifts_canManage',
                        'workOrders_canView',
                        'workOrders_canUpdate',
                        'workOrders_canManage',
                        'timesheets_canView',
                        'timesheets_canUpdate',
                        'timesheets_canManage',
                        'isAdmin'
                    ];
                    if (!validPermissions.includes(permissionField)) {
                        response.status(400).json({
                            success: false,
                            message: 'Invalid permission field'
                        });
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 7, , 8]);
                    return [4 /*yield*/, (0, getUsers_js_1.default)()];
                case 2:
                    users = _b.sent();
                    currentUser = users.find(function (u) { return u.userName === userName; });
                    if (!currentUser) {
                        response.status(404).json({
                            success: false,
                            message: 'User not found'
                        });
                        return [2 /*return*/];
                    }
                    updateForm = {
                        userName: userName,
                        isActive: permissionField === 'isActive'
                            ? !currentUser.isActive
                            : currentUser.isActive,
                        shifts_canView: permissionField === 'shifts_canView'
                            ? !currentUser.shifts_canView
                            : currentUser.shifts_canView,
                        shifts_canUpdate: permissionField === 'shifts_canUpdate'
                            ? !currentUser.shifts_canUpdate
                            : currentUser.shifts_canUpdate,
                        shifts_canManage: permissionField === 'shifts_canManage'
                            ? !currentUser.shifts_canManage
                            : currentUser.shifts_canManage,
                        workOrders_canView: permissionField === 'workOrders_canView'
                            ? !currentUser.workOrders_canView
                            : currentUser.workOrders_canView,
                        workOrders_canUpdate: permissionField === 'workOrders_canUpdate'
                            ? !currentUser.workOrders_canUpdate
                            : currentUser.workOrders_canUpdate,
                        workOrders_canManage: permissionField === 'workOrders_canManage'
                            ? !currentUser.workOrders_canManage
                            : currentUser.workOrders_canManage,
                        timesheets_canView: permissionField === 'timesheets_canView'
                            ? !currentUser.timesheets_canView
                            : currentUser.timesheets_canView,
                        timesheets_canUpdate: permissionField === 'timesheets_canUpdate'
                            ? !currentUser.timesheets_canUpdate
                            : currentUser.timesheets_canUpdate,
                        timesheets_canManage: permissionField === 'timesheets_canManage'
                            ? !currentUser.timesheets_canManage
                            : currentUser.timesheets_canManage,
                        isAdmin: permissionField === 'isAdmin'
                            ? !currentUser.isAdmin
                            : currentUser.isAdmin
                    };
                    return [4 /*yield*/, (0, updateUser_js_1.default)(updateForm, request.session.user)];
                case 3:
                    success = _b.sent();
                    if (!success) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, getUsers_js_1.default)()];
                case 4:
                    updatedUsers = _b.sent();
                    response.json({
                        success: true,
                        message: 'Permission updated successfully',
                        users: updatedUsers
                    });
                    return [3 /*break*/, 6];
                case 5:
                    response.status(404).json({
                        success: false,
                        message: 'User not found'
                    });
                    _b.label = 6;
                case 6: return [3 /*break*/, 8];
                case 7:
                    error_1 = _b.sent();
                    response.status(500).json({
                        success: false,
                        message: error_1 instanceof Error ? error_1.message : 'Failed to update permission'
                    });
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
