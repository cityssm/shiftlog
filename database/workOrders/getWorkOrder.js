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
exports.default = getWorkOrder;
var config_helpers_js_1 = require("../../helpers/config.helpers.js");
var database_helpers_js_1 = require("../../helpers/database.helpers.js");
var getWorkOrderTags_js_1 = require("./getWorkOrderTags.js");
function getWorkOrder(workOrderId, userName) {
    return __awaiter(this, void 0, void 0, function () {
        var pool, sql, workOrdersResult, workOrder, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, (0, database_helpers_js_1.getShiftLogConnectionPool)()];
                case 1:
                    pool = _c.sent();
                    sql = "\n    SELECT\n      w.workOrderId,\n      w.workOrderNumberYear,\n      w.workOrderNumberSequence,\n      w.workOrderNumber,\n      w.workOrderTypeId,\n      wType.workOrderType,\n      w.workOrderStatusDataListItemId,\n      wStatus.dataListItem AS workOrderStatusDataListItem,\n      w.workOrderPriorityDataListItemId,\n      wPriority.dataListItem AS workOrderPriorityDataListItem,\n      w.workOrderDetails,\n      w.workOrderOpenDateTime,\n      w.workOrderDueDateTime,\n      w.workOrderCloseDateTime,\n      w.requestorName,\n      w.requestorContactInfo,\n      w.locationLatitude,\n      w.locationLongitude,\n      w.locationAddress1,\n      w.locationAddress2,\n      w.locationCityProvince,\n      w.assignedToId,\n      assignedTo.assignedToName,\n      moreInfoFormDataJson\n    FROM\n      ShiftLog.WorkOrders w\n      LEFT JOIN ShiftLog.WorkOrderTypes wType ON w.workOrderTypeId = wType.workOrderTypeId\n      LEFT JOIN ShiftLog.DataListItems wStatus ON w.workOrderStatusDataListItemId = wStatus.dataListItemId\n      LEFT JOIN ShiftLog.DataListItems wPriority ON w.workOrderPriorityDataListItemId = wPriority.dataListItemId\n      LEFT JOIN ShiftLog.AssignedTo assignedTo ON w.assignedToId = assignedTo.assignedToId\n    WHERE\n      w.recordDelete_dateTime IS NULL\n      AND w.workOrderId = @workOrderId\n      AND w.instance = @instance ".concat(userName === undefined
                        ? ''
                        : /* sql */ "\n            AND (\n              wType.userGroupId IS NULL\n              OR wType.userGroupId IN (\n                SELECT\n                  userGroupId\n                FROM\n                  ShiftLog.UserGroupMembers\n                WHERE\n                  userName = @userName\n              )\n            )\n          ", "\n  ");
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, pool
                            .request()
                            .input('workOrderId', workOrderId)
                            .input('instance', (0, config_helpers_js_1.getConfigProperty)('application.instance'))
                            .input('userName', userName)
                            .query(sql)];
                case 3:
                    workOrdersResult = _c.sent();
                    if (workOrdersResult.recordset.length === 0) {
                        return [2 /*return*/, undefined];
                    }
                    workOrder = workOrdersResult.recordset[0];
                    if (workOrder.moreInfoFormDataJson === undefined) {
                        workOrder.moreInfoFormData = {};
                    }
                    else {
                        try {
                            workOrder.moreInfoFormData = JSON.parse(workOrder.moreInfoFormDataJson);
                        }
                        catch (_d) {
                            workOrder.moreInfoFormData = {};
                        }
                    }
                    // Get tags for this work order
                    _a = workOrder;
                    return [4 /*yield*/, (0, getWorkOrderTags_js_1.default)(workOrder.workOrderId)];
                case 4:
                    // Get tags for this work order
                    _a.tags = _c.sent();
                    return [2 /*return*/, workOrder];
                case 5:
                    _b = _c.sent();
                    return [2 /*return*/, undefined];
                case 6: return [2 /*return*/];
            }
        });
    });
}
