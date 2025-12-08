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
exports.default = getCalendarEvents;
var config_helpers_js_1 = require("../../helpers/config.helpers.js");
var database_helpers_js_1 = require("../../helpers/database.helpers.js");
/**
 * Retrieves calendar events for work orders and milestones within a specified month.
 * @param filters - Filter parameters including year, month, date type toggles, and assigned to filter
 * @param user - Optional user object for applying user group security filtering.
 *               When provided, only work orders from work order types accessible to the user's groups are returned.
 * @returns Array of calendar events matching the specified filters
 */
function getCalendarEvents(filters, user) {
    return __awaiter(this, void 0, void 0, function () {
        var pool, instance, startDate, endDate, events, userGroupWhereClause, workOrderDateQueries, workOrderQuery, request, workOrderResults, milestoneQueries, milestoneQuery, request, milestoneResults;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, database_helpers_js_1.getShiftLogConnectionPool)()];
                case 1:
                    pool = _a.sent();
                    instance = (0, config_helpers_js_1.getConfigProperty)('application.instance');
                    startDate = new Date(filters.year, filters.month - 1, 1);
                    endDate = new Date(filters.year, filters.month, 0, 23, 59, 59);
                    events = [];
                    userGroupWhereClause = user === undefined
                        ? ''
                        : "and (wType.userGroupId is null or wType.userGroupId in (\n          select userGroupId\n          from ShiftLog.UserGroupMembers\n          where userName = @userName\n        ))";
                    if (!(filters.showOpenDates || filters.showDueDates || filters.showCloseDates)) return [3 /*break*/, 3];
                    workOrderDateQueries = [];
                    if (filters.showOpenDates) {
                        workOrderDateQueries.push(/* sql */ "\n        select\n          w.workOrderOpenDateTime as eventDate,\n          'workOrderOpen' as eventType,\n          w.workOrderId,\n          w.workOrderNumber,\n          w.workOrderDetails,\n          w.assignedToDataListItemId,\n          dt.dataListItem as assignedToDataListItem,\n          null as milestoneId,\n          null as milestoneTitle,\n          w.workOrderCloseDateTime,\n          null as milestoneCompleteDateTime\n        from ShiftLog.WorkOrders w\n        inner join ShiftLog.WorkOrderTypes wType on w.workOrderTypeId = wType.workOrderTypeId\n        left join ShiftLog.DataListItems dt on w.assignedToDataListItemId = dt.dataListItemId\n        where w.instance = @instance\n          and w.recordDelete_dateTime is null\n          and w.workOrderOpenDateTime between @startDate and @endDate\n          ".concat(filters.assignedToDataListItemId === undefined ? '' : 'and w.assignedToDataListItemId = @assignedToDataListItemId', "\n          ").concat(userGroupWhereClause, "\n      "));
                    }
                    if (filters.showDueDates) {
                        workOrderDateQueries.push(/* sql */ "\n        select\n          w.workOrderDueDateTime as eventDate,\n          'workOrderDue' as eventType,\n          w.workOrderId,\n          w.workOrderNumber,\n          w.workOrderDetails,\n          w.assignedToDataListItemId,\n          dt.dataListItem as assignedToDataListItem,\n          null as milestoneId,\n          null as milestoneTitle,\n          w.workOrderCloseDateTime,\n          null as milestoneCompleteDateTime\n        from ShiftLog.WorkOrders w\n        inner join ShiftLog.WorkOrderTypes wType on w.workOrderTypeId = wType.workOrderTypeId\n        left join ShiftLog.DataListItems dt on w.assignedToDataListItemId = dt.dataListItemId\n        where w.instance = @instance\n          and w.recordDelete_dateTime is null\n          and w.workOrderDueDateTime is not null\n          and w.workOrderDueDateTime between @startDate and @endDate\n          ".concat(filters.assignedToDataListItemId === undefined ? '' : 'and w.assignedToDataListItemId = @assignedToDataListItemId', "\n          ").concat(userGroupWhereClause, "\n      "));
                    }
                    if (filters.showCloseDates) {
                        workOrderDateQueries.push(/* sql */ "\n        select\n          w.workOrderCloseDateTime as eventDate,\n          'workOrderClose' as eventType,\n          w.workOrderId,\n          w.workOrderNumber,\n          w.workOrderDetails,\n          w.assignedToDataListItemId,\n          dt.dataListItem as assignedToDataListItem,\n          null as milestoneId,\n          null as milestoneTitle,\n          w.workOrderCloseDateTime,\n          null as milestoneCompleteDateTime\n        from ShiftLog.WorkOrders w\n        inner join ShiftLog.WorkOrderTypes wType on w.workOrderTypeId = wType.workOrderTypeId\n        left join ShiftLog.DataListItems dt on w.assignedToDataListItemId = dt.dataListItemId\n        where w.instance = @instance\n          and w.recordDelete_dateTime is null\n          and w.workOrderCloseDateTime is not null\n          and w.workOrderCloseDateTime between @startDate and @endDate\n          ".concat(filters.assignedToDataListItemId === undefined ? '' : 'and w.assignedToDataListItemId = @assignedToDataListItemId', "\n          ").concat(userGroupWhereClause, "\n      "));
                    }
                    if (!(workOrderDateQueries.length > 0)) return [3 /*break*/, 3];
                    workOrderQuery = workOrderDateQueries.join(' union all ');
                    request = pool.request();
                    request.input('instance', instance);
                    request.input('startDate', startDate);
                    request.input('endDate', endDate);
                    if (filters.assignedToDataListItemId !== undefined) {
                        request.input('assignedToDataListItemId', filters.assignedToDataListItemId);
                    }
                    if (user !== undefined) {
                        request.input('userName', user.userName);
                    }
                    return [4 /*yield*/, request.query(workOrderQuery)];
                case 2:
                    workOrderResults = _a.sent();
                    events.push.apply(events, workOrderResults.recordset);
                    _a.label = 3;
                case 3:
                    if (!(filters.showMilestoneDueDates || filters.showMilestoneCompleteDates)) return [3 /*break*/, 5];
                    milestoneQueries = [];
                    if (filters.showMilestoneDueDates) {
                        milestoneQueries.push(/* sql */ "\n        select\n          m.milestoneDueDateTime as eventDate,\n          'milestoneDue' as eventType,\n          w.workOrderId,\n          w.workOrderNumber,\n          w.workOrderDetails,\n          coalesce(m.assignedToDataListItemId, w.assignedToDataListItemId) as assignedToDataListItemId,\n          coalesce(mdt.dataListItem, wdt.dataListItem) as assignedToDataListItem,\n          m.workOrderMilestoneId as milestoneId,\n          m.milestoneTitle,\n          w.workOrderCloseDateTime,\n          m.milestoneCompleteDateTime\n        from ShiftLog.WorkOrderMilestones m\n        inner join ShiftLog.WorkOrders w on m.workOrderId = w.workOrderId\n        inner join ShiftLog.WorkOrderTypes wType on w.workOrderTypeId = wType.workOrderTypeId\n        left join ShiftLog.DataListItems mdt on m.assignedToDataListItemId = mdt.dataListItemId\n        left join ShiftLog.DataListItems wdt on w.assignedToDataListItemId = wdt.dataListItemId\n        where w.instance = @instance\n          and w.recordDelete_dateTime is null\n          and m.recordDelete_dateTime is null\n          and m.milestoneDueDateTime is not null\n          and m.milestoneDueDateTime between @startDate and @endDate\n          ".concat(filters.assignedToDataListItemId === undefined
                            ? ''
                            : "and (m.assignedToDataListItemId = @assignedToDataListItemId\n                   or (m.assignedToDataListItemId is null and w.assignedToDataListItemId = @assignedToDataListItemId))", "\n          ").concat(userGroupWhereClause, "\n      "));
                    }
                    if (filters.showMilestoneCompleteDates) {
                        milestoneQueries.push(/* sql */ "\n        select\n          m.milestoneCompleteDateTime as eventDate,\n          'milestoneComplete' as eventType,\n          w.workOrderId,\n          w.workOrderNumber,\n          w.workOrderDetails,\n          coalesce(m.assignedToDataListItemId, w.assignedToDataListItemId) as assignedToDataListItemId,\n          coalesce(mdt.dataListItem, wdt.dataListItem) as assignedToDataListItem,\n          m.workOrderMilestoneId as milestoneId,\n          m.milestoneTitle,\n          w.workOrderCloseDateTime,\n          m.milestoneCompleteDateTime\n        from ShiftLog.WorkOrderMilestones m\n        inner join ShiftLog.WorkOrders w on m.workOrderId = w.workOrderId\n        inner join ShiftLog.WorkOrderTypes wType on w.workOrderTypeId = wType.workOrderTypeId\n        left join ShiftLog.DataListItems mdt on m.assignedToDataListItemId = mdt.dataListItemId\n        left join ShiftLog.DataListItems wdt on w.assignedToDataListItemId = wdt.dataListItemId\n        where w.instance = @instance\n          and w.recordDelete_dateTime is null\n          and m.recordDelete_dateTime is null\n          and m.milestoneCompleteDateTime is not null\n          and m.milestoneCompleteDateTime between @startDate and @endDate\n          ".concat(filters.assignedToDataListItemId === undefined
                            ? ''
                            : "and (m.assignedToDataListItemId = @assignedToDataListItemId\n                   or (m.assignedToDataListItemId is null and w.assignedToDataListItemId = @assignedToDataListItemId))", "\n          ").concat(userGroupWhereClause, "\n      "));
                    }
                    if (!(milestoneQueries.length > 0)) return [3 /*break*/, 5];
                    milestoneQuery = milestoneQueries.join(' union all ');
                    request = pool.request();
                    request.input('instance', instance);
                    request.input('startDate', startDate);
                    request.input('endDate', endDate);
                    if (filters.assignedToDataListItemId !== undefined) {
                        request.input('assignedToDataListItemId', filters.assignedToDataListItemId);
                    }
                    if (user !== undefined) {
                        request.input('userName', user.userName);
                    }
                    return [4 /*yield*/, request.query(milestoneQuery)];
                case 4:
                    milestoneResults = _a.sent();
                    events.push.apply(events, milestoneResults.recordset);
                    _a.label = 5;
                case 5: return [2 /*return*/, events];
            }
        });
    });
}
