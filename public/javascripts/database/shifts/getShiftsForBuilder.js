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
exports.default = getShiftsForBuilder;
var config_helpers_js_1 = require("../../helpers/config.helpers.js");
var database_helpers_js_1 = require("../../helpers/database.helpers.js");
function getShiftsForBuilder(shiftDateString, user) {
    return __awaiter(this, void 0, void 0, function () {
        var pool, whereClause, sql, shiftsResult, shifts, shiftIds, crewsSql, crewsResult, employeesSql, employeesResult, equipmentSql, equipmentResult, workOrdersSql, workOrdersResult, _loop_1, _i, shifts_1, shift;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, (0, database_helpers_js_1.getShiftLogConnectionPool)()];
                case 1:
                    pool = _e.sent();
                    whereClause = "\n    where s.instance = @instance\n    and s.recordDelete_dateTime is null\n    and s.shiftDate = @shiftDateString\n  ";
                    if (user !== undefined) {
                        whereClause += "\n      and (\n        sType.userGroupId is null or sType.userGroupId in (\n          select userGroupId\n          from ShiftLog.UserGroupMembers\n          where userName = @userName\n        )\n      )\n    ";
                    }
                    sql = "\n    select\n      s.shiftId,\n      s.shiftDate,\n      s.shiftTimeDataListItemId,\n      sTime.dataListItem as shiftTimeDataListItem,\n      s.shiftTypeDataListItemId,\n      sType.dataListItem as shiftTypeDataListItem,\n      s.supervisorEmployeeNumber,\n      sup.firstName as supervisorFirstName,\n      sup.lastName as supervisorLastName,\n      sup.userName as supervisorUserName,\n      s.shiftDescription,\n      s.recordCreate_userName,\n      s.recordCreate_dateTime,\n      s.recordUpdate_userName,\n      s.recordUpdate_dateTime,\n      s.recordLock_dateTime\n    from ShiftLog.Shifts s\n    left join ShiftLog.DataListItems sTime\n      on s.shiftTimeDataListItemId = sTime.dataListItemId\n    left join ShiftLog.DataListItems sType\n      on s.shiftTypeDataListItemId = sType.dataListItemId\n    left join ShiftLog.Employees sup\n      on s.supervisorEmployeeNumber = sup.employeeNumber\n      and s.instance = sup.instance\n    ".concat(whereClause, "\n    order by s.shiftTimeDataListItemId, s.shiftTypeDataListItemId\n  ");
                    return [4 /*yield*/, pool
                            .request()
                            .input('instance', (0, config_helpers_js_1.getConfigProperty)('application.instance'))
                            .input('shiftDateString', shiftDateString)
                            .input('userName', user === null || user === void 0 ? void 0 : user.userName)
                            .query(sql)];
                case 2:
                    shiftsResult = _e.sent();
                    shifts = shiftsResult.recordset;
                    shiftIds = shifts.map(function (shift) { return shift.shiftId; });
                    if (shiftIds.length === 0) {
                        return [2 /*return*/, []];
                    }
                    crewsSql = "\n    select\n      sc.shiftId,\n      sc.crewId,\n      c.crewName,\n      sc.shiftCrewNote\n    from ShiftLog.ShiftCrews sc\n    inner join ShiftLog.Crews c\n      on sc.crewId = c.crewId\n    where sc.shiftId in (".concat(shiftIds.join(','), ")\n    and c.recordDelete_dateTime is null\n    order by c.crewName\n  ");
                    return [4 /*yield*/, pool.request().query(crewsSql)
                        // Get employees
                    ];
                case 3:
                    crewsResult = _e.sent();
                    employeesSql = "\n    select\n      se.shiftId,\n      se.employeeNumber,\n      e.firstName,\n      e.lastName,\n      se.crewId,\n      c.crewName,\n      se.shiftEmployeeNote\n    from ShiftLog.ShiftEmployees se\n    inner join ShiftLog.Employees e\n      on se.employeeNumber = e.employeeNumber\n      and se.instance = e.instance\n    left join ShiftLog.Crews c\n      on se.crewId = c.crewId\n    where se.shiftId in (".concat(shiftIds.join(','), ")\n    and e.recordDelete_dateTime is null\n    order by e.lastName, e.firstName\n  ");
                    return [4 /*yield*/, pool.request().query(employeesSql)
                        // Get equipment
                    ];
                case 4:
                    employeesResult = _e.sent();
                    equipmentSql = "\n    select\n      seq.shiftId,\n      seq.equipmentNumber,\n      eq.equipmentName,\n      seq.employeeNumber,\n      e.firstName as employeeFirstName,\n      e.lastName as employeeLastName,\n      seq.shiftEquipmentNote\n    from ShiftLog.ShiftEquipment seq\n    inner join ShiftLog.Equipment eq\n      on seq.equipmentNumber = eq.equipmentNumber\n      and seq.instance = eq.instance\n    left join ShiftLog.Employees e\n      on seq.employeeNumber = e.employeeNumber\n      and seq.instance = e.instance\n    where seq.shiftId in (".concat(shiftIds.join(','), ")\n    and eq.recordDelete_dateTime is null\n    order by eq.equipmentName\n  ");
                    return [4 /*yield*/, pool.request().query(equipmentSql)
                        // Get work orders
                    ];
                case 5:
                    equipmentResult = _e.sent();
                    workOrdersSql = "\n    select\n      sw.shiftId,\n      sw.workOrderId,\n      wo.workOrderNumber,\n      wo.workOrderDetails,\n      sw.shiftWorkOrderNote\n    from ShiftLog.ShiftWorkOrders sw\n    inner join ShiftLog.WorkOrders wo\n      on sw.workOrderId = wo.workOrderId\n    where sw.shiftId in (".concat(shiftIds.join(','), ")\n    and wo.recordDelete_dateTime is null\n    order by wo.workOrderNumber\n  ");
                    return [4 /*yield*/, pool.request().query(workOrdersSql)
                        // Combine data
                    ];
                case 6:
                    workOrdersResult = _e.sent();
                    _loop_1 = function (shift) {
                        shift.crews =
                            (_a = crewsResult.recordset.filter(function (c) { return c.shiftId === shift.shiftId; })) !== null && _a !== void 0 ? _a : [];
                        shift.employees =
                            (_b = employeesResult.recordset.filter(function (e) { return e.shiftId === shift.shiftId; })) !== null && _b !== void 0 ? _b : [];
                        shift.equipment =
                            (_c = equipmentResult.recordset.filter(function (eq) { return eq.shiftId === shift.shiftId; })) !== null && _c !== void 0 ? _c : [];
                        shift.workOrders =
                            (_d = workOrdersResult.recordset.filter(function (w) { return w.shiftId === shift.shiftId; })) !== null && _d !== void 0 ? _d : [];
                    };
                    // Combine data
                    for (_i = 0, shifts_1 = shifts; _i < shifts_1.length; _i++) {
                        shift = shifts_1[_i];
                        _loop_1(shift);
                    }
                    return [2 /*return*/, shifts];
            }
        });
    });
}
