"use strict";
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
exports.default = getTimesheets;
var config_helpers_js_1 = require("../../helpers/config.helpers.js");
var database_helpers_js_1 = require("../../helpers/database.helpers.js");
function buildWhereClause(filters, user) {
    var whereClause = 'where t.instance = @instance and t.recordDelete_dateTime is null';
    if (filters.timesheetDateString !== undefined) {
        whereClause += ' and t.timesheetDate = @timesheetDateString';
    }
    if (filters.supervisorEmployeeNumber !== undefined &&
        filters.supervisorEmployeeNumber !== '') {
        whereClause += ' and t.supervisorEmployeeNumber = @supervisorEmployeeNumber';
    }
    if (filters.timesheetTypeDataListItemId !== undefined &&
        filters.timesheetTypeDataListItemId !== '') {
        whereClause +=
            ' and t.timesheetTypeDataListItemId = @timesheetTypeDataListItemId';
    }
    if (user !== undefined) {
        whereClause += "\n      and (\n        tType.userGroupId is null or tType.userGroupId in (\n          select userGroupId\n          from ShiftLog.UserGroupMembers\n          where userName = @userName\n        )\n      )\n    ";
    }
    return whereClause;
}
function getTimesheets(filters, options, user) {
    return __awaiter(this, void 0, void 0, function () {
        var pool, whereClause, limit, offset, totalCount, countSql, countResult, timesheets, timesheetsResult;
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0: return [4 /*yield*/, (0, database_helpers_js_1.getShiftLogConnectionPool)()];
                case 1:
                    pool = _j.sent();
                    whereClause = buildWhereClause(filters, user);
                    limit = typeof options.limit === 'string'
                        ? Number.parseInt(options.limit, 10)
                        : options.limit;
                    offset = typeof options.offset === 'string'
                        ? Number.parseInt(options.offset, 10)
                        : options.offset;
                    totalCount = 0;
                    if (!(limit !== -1)) return [3 /*break*/, 3];
                    countSql = "\n      select count(*) as totalCount\n      from ShiftLog.Timesheets t\n      left join ShiftLog.DataListItems tType\n        on t.timesheetTypeDataListItemId = tType.dataListItemId\n      ".concat(whereClause, "\n    ");
                    return [4 /*yield*/, pool
                            .request()
                            .input('instance', (0, config_helpers_js_1.getConfigProperty)('application.instance'))
                            .input('timesheetDateString', (_a = filters.timesheetDateString) !== null && _a !== void 0 ? _a : null)
                            .input('supervisorEmployeeNumber', (_b = filters.supervisorEmployeeNumber) !== null && _b !== void 0 ? _b : null)
                            .input('timesheetTypeDataListItemId', (_c = filters.timesheetTypeDataListItemId) !== null && _c !== void 0 ? _c : null)
                            .input('userName', user === null || user === void 0 ? void 0 : user.userName)
                            .query(countSql)];
                case 2:
                    countResult = _j.sent();
                    totalCount = (_e = (_d = countResult.recordset[0]) === null || _d === void 0 ? void 0 : _d.totalCount) !== null && _e !== void 0 ? _e : 0;
                    _j.label = 3;
                case 3:
                    timesheets = [];
                    if (!(totalCount > 0 || limit === -1)) return [3 /*break*/, 5];
                    return [4 /*yield*/, pool
                            .request()
                            .input('instance', (0, config_helpers_js_1.getConfigProperty)('application.instance'))
                            .input('timesheetDateString', (_f = filters.timesheetDateString) !== null && _f !== void 0 ? _f : null)
                            .input('supervisorEmployeeNumber', (_g = filters.supervisorEmployeeNumber) !== null && _g !== void 0 ? _g : null)
                            .input('timesheetTypeDataListItemId', (_h = filters.timesheetTypeDataListItemId) !== null && _h !== void 0 ? _h : null)
                            .input('userName', user === null || user === void 0 ? void 0 : user.userName).query(/* sql */ "\n        select\n          t.timesheetId, t.timesheetDate,\n          \n          t.timesheetTypeDataListItemId,\n          tType.dataListItem as timesheetTypeDataListItem,\n          \n          t.supervisorEmployeeNumber,\n          e.firstName as supervisorFirstName,\n          e.lastName as supervisorLastName,\n          e.userName as supervisorUserName,\n\n          t.timesheetTitle,\n          t.timesheetNote,\n          \n          t.shiftId,\n\n          t.recordSubmitted_dateTime,\n          t.recordSubmitted_userName,\n\n          t.employeesEntered_dateTime,\n          t.employeesEntered_userName,\n\n          t.equipmentEntered_dateTime,\n          t.equipmentEntered_userName\n\n        from ShiftLog.Timesheets t\n\n        left join ShiftLog.DataListItems tType\n          on t.timesheetTypeDataListItemId = tType.dataListItemId\n          \n        left join ShiftLog.Employees e\n          on t.instance = e.instance and t.supervisorEmployeeNumber = e.employeeNumber\n\n        ".concat(whereClause, "    \n\n        order by t.timesheetDate desc, tType.dataListItem, t.timesheetTitle\n\n        ").concat(limit === -1 ? '' : " offset ".concat(offset, " rows"), "\n        ").concat(limit === -1 ? '' : " fetch next ".concat(limit, " rows only"), "\n      "))];
                case 4:
                    timesheetsResult = _j.sent();
                    timesheets = timesheetsResult.recordset;
                    if (limit === -1) {
                        totalCount = timesheets.length;
                    }
                    _j.label = 5;
                case 5: return [2 /*return*/, {
                        timesheets: timesheets,
                        totalCount: totalCount
                    }];
            }
        });
    });
}
//# sourceMappingURL=getTimesheets.js.map