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
exports.default = getShifts;
var config_helpers_js_1 = require("../../helpers/config.helpers.js");
var database_helpers_js_1 = require("../../helpers/database.helpers.js");
function buildWhereClause(filters, user) {
    var whereClause = 'where s.instance = @instance and s.recordDelete_dateTime is null';
    if (filters.shiftDateString !== undefined && filters.shiftDateString !== '') {
        whereClause += ' and s.shiftDate = @shiftDateString';
    }
    if (filters.shiftTypeDataListItemId !== undefined && filters.shiftTypeDataListItemId !== '') {
        whereClause += ' and s.shiftTypeDataListItemId = @shiftTypeDataListItemId';
    }
    if (filters.supervisorEmployeeNumber !== undefined && filters.supervisorEmployeeNumber !== '') {
        whereClause += ' and s.supervisorEmployeeNumber = @supervisorEmployeeNumber';
    }
    if (user !== undefined) {
        whereClause += "\n      and (\n        sType.userGroupId is null or sType.userGroupId in (\n          select userGroupId\n          from ShiftLog.UserGroupMembers\n          where userName = @userName\n        )\n      )\n    ";
    }
    return whereClause;
}
function getShifts(filters, options, user) {
    return __awaiter(this, void 0, void 0, function () {
        var pool, whereClause, limit, offset, totalCount, countSql, countResult, shifts, shiftsResult;
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
                    countSql = "\n      select count(*) as totalCount\n      from ShiftLog.Shifts s\n      left join ShiftLog.DataListItems sType\n        on s.shiftTypeDataListItemId = sType.dataListItemId\n      ".concat(whereClause, "\n    ");
                    return [4 /*yield*/, pool
                            .request()
                            .input('instance', (0, config_helpers_js_1.getConfigProperty)('application.instance'))
                            .input('shiftDateString', (_a = filters.shiftDateString) !== null && _a !== void 0 ? _a : null)
                            .input('shiftTypeDataListItemId', (_b = filters.shiftTypeDataListItemId) !== null && _b !== void 0 ? _b : null)
                            .input('supervisorEmployeeNumber', (_c = filters.supervisorEmployeeNumber) !== null && _c !== void 0 ? _c : null)
                            .input('userName', user === null || user === void 0 ? void 0 : user.userName)
                            .query(countSql)];
                case 2:
                    countResult = _j.sent();
                    totalCount = (_e = (_d = countResult.recordset[0]) === null || _d === void 0 ? void 0 : _d.totalCount) !== null && _e !== void 0 ? _e : 0;
                    _j.label = 3;
                case 3:
                    shifts = [];
                    if (!(totalCount > 0 || limit === -1)) return [3 /*break*/, 5];
                    return [4 /*yield*/, pool
                            .request()
                            .input('instance', (0, config_helpers_js_1.getConfigProperty)('application.instance'))
                            .input('shiftDateString', (_f = filters.shiftDateString) !== null && _f !== void 0 ? _f : null)
                            .input('shiftTypeDataListItemId', (_g = filters.shiftTypeDataListItemId) !== null && _g !== void 0 ? _g : null)
                            .input('supervisorEmployeeNumber', (_h = filters.supervisorEmployeeNumber) !== null && _h !== void 0 ? _h : null)
                            .input('userName', user === null || user === void 0 ? void 0 : user.userName).query(/* sql */ "\n        select\n          s.shiftId, s.shiftDate,\n\n          s.shiftTimeDataListItemId,\n          sTime.dataListItem as shiftTimeDataListItem,\n\n          s.shiftTypeDataListItemId,\n          sType.dataListItem as shiftTypeDataListItem,\n          \n          s.supervisorEmployeeNumber,\n          e.firstName as supervisorFirstName,\n          e.lastName as supervisorLastName,\n          e.userName as supervisorUserName,\n\n          s.shiftDescription,\n\n          -- Counts\n          (select count(*) from ShiftLog.ShiftWorkOrders wo where wo.shiftId = s.shiftId) as workOrdersCount,\n          (select count(*) from ShiftLog.ShiftEmployees se where se.shiftId = s.shiftId) as employeesCount,\n          (select count(*) from ShiftLog.ShiftCrews sc where sc.shiftId = s.shiftId) as crewsCount,\n          (select count(*) from ShiftLog.ShiftEquipment seq where seq.shiftId = s.shiftId) as equipmentCount,\n          (select count(*) from ShiftLog.Timesheets t where t.shiftId = s.shiftId and t.recordDelete_dateTime is null) as timesheetsCount\n\n        from ShiftLog.Shifts s\n\n        left join ShiftLog.DataListItems sTime\n          on s.shiftTimeDataListItemId = sTime.dataListItemId\n\n        left join ShiftLog.DataListItems sType\n          on s.shiftTypeDataListItemId = sType.dataListItemId\n          \n        left join ShiftLog.Employees e\n          on s.instance = e.instance\n          and s.supervisorEmployeeNumber = e.employeeNumber\n\n        ".concat(whereClause, "    \n\n        order by s.shiftDate desc, sType.dataListItem, sTime.dataListItem\n\n        ").concat(limit === -1 ? '' : " offset ".concat(offset, " rows"), "\n        ").concat(limit === -1 ? '' : " fetch next ".concat(limit, " rows only"), "\n      "))];
                case 4:
                    shiftsResult = _j.sent();
                    shifts = shiftsResult.recordset;
                    if (limit === -1) {
                        totalCount = shifts.length;
                    }
                    _j.label = 5;
                case 5: return [2 /*return*/, {
                        shifts: shifts,
                        totalCount: totalCount
                    }];
            }
        });
    });
}
