"use strict";
// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable unicorn/no-null */
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
exports.default = getWorkOrdersForPlanner;
var config_helpers_js_1 = require("../../helpers/config.helpers.js");
var database_helpers_js_1 = require("../../helpers/database.helpers.js");
function buildWhereClause(filters, user) {
    var whereClause = 'where w.instance = @instance and w.recordDelete_dateTime is null';
    // Only include open work orders
    whereClause += ' and w.workOrderCloseDateTime is null';
    if (filters.workOrderTypeId !== undefined && filters.workOrderTypeId !== '') {
        whereClause += ' and w.workOrderTypeId = @workOrderTypeId';
    }
    if (filters.workOrderStatusDataListItemId !== undefined &&
        filters.workOrderStatusDataListItemId !== '') {
        whereClause +=
            ' and w.workOrderStatusDataListItemId = @workOrderStatusDataListItemId';
    }
    // Handle assigned/unassigned filter
    if (filters.includeUnassigned === true) {
        whereClause += " and (\n      w.assignedToDataListItemId is null\n      or exists (\n        select 1 from ShiftLog.WorkOrderMilestones\n        where workOrderId = w.workOrderId\n          and assignedToDataListItemId is null\n          and recordDelete_dateTime is null\n      )\n    )";
    }
    else if (filters.assignedToDataListItemId !== undefined &&
        filters.assignedToDataListItemId !== '') {
        whereClause += " and (\n      w.assignedToDataListItemId = @assignedToDataListItemId\n      or exists (\n        select 1 from ShiftLog.WorkOrderMilestones\n        where workOrderId = w.workOrderId\n          and assignedToDataListItemId = @assignedToDataListItemId\n          and recordDelete_dateTime is null\n      )\n    )";
    }
    // Handle date filters
    if (filters.dateFilter !== undefined && filters.dateFilter !== '') {
        switch (filters.dateFilter) {
            case 'overdue': {
                whereClause += ' and w.workOrderDueDateTime < getdate()';
                break;
            }
            case 'openForDays': {
                whereClause +=
                    ' and datediff(day, w.workOrderOpenDateTime, getdate()) >= @daysThreshold';
                break;
            }
            case 'dueInDays': {
                whereClause += " and w.workOrderDueDateTime is not null\n          and datediff(day, getdate(), w.workOrderDueDateTime) <= @daysThreshold\n          and w.workOrderDueDateTime >= getdate()";
                break;
            }
            case 'noUpdatesForDays': {
                whereClause += " and (\n          w.recordUpdate_dateTime is null\n          or datediff(day, w.recordUpdate_dateTime, getdate()) >= @daysThreshold\n        )";
                break;
            }
            case 'milestonesOverdue': {
                whereClause += " and exists (\n          select 1 from ShiftLog.WorkOrderMilestones\n          where workOrderId = w.workOrderId\n            and milestoneCompleteDateTime is null\n            and milestoneDueDateTime < getdate()\n            and recordDelete_dateTime is null\n        )";
                break;
            }
            case 'milestonesDueInDays': {
                whereClause += " and exists (\n          select 1 from ShiftLog.WorkOrderMilestones\n          where workOrderId = w.workOrderId\n            and milestoneCompleteDateTime is null\n            and milestoneDueDateTime is not null\n            and datediff(day, getdate(), milestoneDueDateTime) <= @daysThreshold\n            and milestoneDueDateTime >= getdate()\n            and recordDelete_dateTime is null\n        )";
                break;
            }
        }
    }
    if (user !== undefined) {
        whereClause += "\n      and (\n        wType.userGroupId is null or wType.userGroupId in (\n          select userGroupId\n          from ShiftLog.UserGroupMembers\n          where userName = @userName\n        )\n      )\n    ";
    }
    return whereClause;
}
function applyParameters(sqlRequest, filters, user) {
    var _a, _b, _c;
    sqlRequest
        .input('instance', (0, config_helpers_js_1.getConfigProperty)('application.instance'))
        .input('workOrderTypeId', (_a = filters.workOrderTypeId) !== null && _a !== void 0 ? _a : null)
        .input('workOrderStatusDataListItemId', (_b = filters.workOrderStatusDataListItemId) !== null && _b !== void 0 ? _b : null)
        .input('assignedToDataListItemId', (_c = filters.assignedToDataListItemId) !== null && _c !== void 0 ? _c : null)
        .input('daysThreshold', filters.daysThreshold === undefined
        ? null
        : typeof filters.daysThreshold === 'string'
            ? Number.parseInt(filters.daysThreshold, 10)
            : filters.daysThreshold)
        .input('userName', user === null || user === void 0 ? void 0 : user.userName);
}
function getWorkOrdersForPlanner(filters, options, user) {
    return __awaiter(this, void 0, void 0, function () {
        var pool, whereClause, limit, offset, totalCount, countSql, countRequest, countResult, workOrders, workOrdersRequest, workOrdersResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, database_helpers_js_1.getShiftLogConnectionPool)()];
                case 1:
                    pool = _a.sent();
                    whereClause = buildWhereClause(filters, user);
                    limit = typeof options.limit === 'string'
                        ? Number.parseInt(options.limit, 10)
                        : options.limit;
                    offset = typeof options.offset === 'string'
                        ? Number.parseInt(options.offset, 10)
                        : options.offset;
                    totalCount = 0;
                    if (!(limit !== -1)) return [3 /*break*/, 3];
                    countSql = "\n      select count(*) as totalCount\n      from ShiftLog.WorkOrders w\n      left join ShiftLog.WorkOrderTypes wType\n        on w.workOrderTypeId = wType.workOrderTypeId\n      ".concat(whereClause, "\n    ");
                    countRequest = pool.request();
                    applyParameters(countRequest, filters, user);
                    return [4 /*yield*/, countRequest.query(countSql)];
                case 2:
                    countResult = _a.sent();
                    totalCount = countResult.recordset[0].totalCount;
                    _a.label = 3;
                case 3:
                    workOrders = [];
                    if (!(totalCount > 0 || limit === -1)) return [3 /*break*/, 5];
                    workOrdersRequest = pool.request();
                    applyParameters(workOrdersRequest, filters, user);
                    return [4 /*yield*/, workOrdersRequest.query(/* sql */ "\n        select\n          w.workOrderId,\n\n          w.workOrderNumberPrefix,\n          w.workOrderNumberYear,\n          w.workOrderNumberSequence,\n          w.workOrderNumberOverride,\n          w.workOrderNumber,\n\n          w.workOrderTypeId,\n          wType.workOrderType,\n\n          w.workOrderStatusDataListItemId,\n          wStatus.dataListItem as workOrderStatusDataListItem,\n\n          w.workOrderDetails,\n\n          w.workOrderOpenDateTime,\n          w.workOrderDueDateTime,\n          w.workOrderCloseDateTime,\n\n          w.requestorName,\n          w.requestorContactInfo,\n\n          w.locationLatitude,\n          w.locationLongitude,\n          w.locationAddress1,\n          w.locationAddress2,\n          w.locationCityProvince,\n\n          w.assignedToDataListItemId,\n          assignedTo.dataListItem as assignedToDataListItem,\n\n          milestones.milestonesCount,\n          milestones.milestonesCompletedCount,\n          milestones.overdueMilestonesCount\n          \n        from ShiftLog.WorkOrders w\n\n        left join ShiftLog.WorkOrderTypes wType\n          on w.workOrderTypeId = wType.workOrderTypeId\n\n        left join ShiftLog.DataListItems wStatus\n          on w.workOrderStatusDataListItemId = wStatus.dataListItemId\n\n        left join ShiftLog.DataListItems assignedTo\n          on w.assignedToDataListItemId = assignedTo.dataListItemId\n\n        left join (\n          select workOrderId,\n            count(*) as milestonesCount,\n            sum(\n              case when milestoneCompleteDateTime is null then 0 else 1 end\n            ) as milestonesCompletedCount,\n            sum(\n              case when milestoneCompleteDateTime is null and milestoneDueDateTime < getdate() then 1 else 0 end\n            ) as overdueMilestonesCount\n          from ShiftLog.WorkOrderMilestones\n          where recordDelete_dateTime is null\n          group by workOrderId\n        ) as milestones on milestones.workOrderId = w.workOrderId\n\n        ".concat(whereClause, "    \n\n        order by \n          case when w.workOrderDueDateTime < getdate() then 0 else 1 end,\n          w.workOrderDueDateTime,\n          w.workOrderOpenDateTime desc\n\n        ").concat(limit === -1 ? '' : " offset ".concat(offset, " rows"), "\n        ").concat(limit === -1 ? '' : " fetch next ".concat(limit, " rows only"), "\n      "))];
                case 4:
                    workOrdersResult = _a.sent();
                    workOrders = workOrdersResult.recordset;
                    if (limit === -1) {
                        totalCount = workOrders.length;
                    }
                    _a.label = 5;
                case 5: return [2 /*return*/, {
                        workOrders: workOrders,
                        totalCount: totalCount
                    }];
            }
        });
    });
}
