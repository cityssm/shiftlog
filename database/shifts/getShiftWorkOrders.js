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
exports.default = getShiftWorkOrders;
var config_helpers_js_1 = require("../../helpers/config.helpers.js");
var database_helpers_js_1 = require("../../helpers/database.helpers.js");
function getShiftWorkOrders(shiftId) {
    return __awaiter(this, void 0, void 0, function () {
        var pool, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, database_helpers_js_1.getShiftLogConnectionPool)()];
                case 1:
                    pool = _a.sent();
                    return [4 /*yield*/, pool
                            .request()
                            .input('shiftId', shiftId)
                            .input('instance', (0, config_helpers_js_1.getConfigProperty)('application.instance')).query(
                        /* sql */ "\n        select\n          w.workOrderId,\n          w.workOrderNumberPrefix,\n          w.workOrderNumberYear,\n          w.workOrderNumberSequence,\n          w.workOrderNumberOverride,\n          w.workOrderNumber,\n          w.workOrderTypeId,\n          wt.workOrderType,\n          w.workOrderStatusDataListItemId,\n          wsd.dataListItem as workOrderStatusDataListItem,\n          w.workOrderDetails,\n          w.workOrderOpenDateTime,\n          w.workOrderDueDateTime,\n          w.workOrderCloseDateTime,\n          w.requestorName,\n          w.requestorContactInfo,\n          w.assignedToDataListItemId,\n          atd.dataListItem as assignedToDataListItem,\n          w.locationAddress1,\n          w.locationAddress2,\n          w.locationCityProvince,\n          w.locationLatitude,\n          w.locationLongitude,\n          sw.shiftWorkOrderNote,\n          w.recordCreate_userName,\n          w.recordCreate_dateTime,\n          w.recordUpdate_userName,\n          w.recordUpdate_dateTime\n        from ShiftLog.ShiftWorkOrders sw\n        inner join ShiftLog.WorkOrders w on sw.workOrderId = w.workOrderId\n        inner join ShiftLog.WorkOrderTypes wt on w.workOrderTypeId = wt.workOrderTypeId\n        left join ShiftLog.DataListItems wsd on w.workOrderStatusDataListItemId = wsd.dataListItemId\n        left join ShiftLog.DataListItems atd on w.assignedToDataListItemId = atd.dataListItemId\n        where sw.shiftId = @shiftId\n          and w.instance = @instance\n          and w.recordDelete_dateTime is null\n        order by w.workOrderNumber desc\n      ")];
                case 2:
                    result = (_a.sent());
                    return [2 /*return*/, result.recordset];
            }
        });
    });
}
