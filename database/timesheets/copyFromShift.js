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
exports.default = copyFromShift;
var database_helpers_js_1 = require("../../helpers/database.helpers.js");
function copyFromShift(shiftId, timesheetId) {
    return __awaiter(this, void 0, void 0, function () {
        var pool;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, database_helpers_js_1.getShiftLogConnectionPool)()
                    // Copy work orders as columns
                ];
                case 1:
                    pool = _a.sent();
                    // Copy work orders as columns
                    return [4 /*yield*/, pool
                            .request()
                            .input('shiftId', shiftId)
                            .input('timesheetId', timesheetId)
                            .query(/* sql */ "\n      insert into ShiftLog.TimesheetColumns (\n        timesheetId,\n        columnTitle,\n        workOrderNumber,\n        orderNumber\n      )\n      select\n        @timesheetId,\n        w.workOrderNumber,\n        w.workOrderNumber,\n        row_number() over (order by w.workOrderNumber) - 1\n      from ShiftLog.ShiftWorkOrders sw\n      inner join ShiftLog.WorkOrders w\n        on sw.workOrderId = w.workOrderId\n      where sw.shiftId = @shiftId\n        and w.recordDelete_dateTime is null\n    ")
                        // Copy employees as rows
                    ];
                case 2:
                    // Copy work orders as columns
                    _a.sent();
                    // Copy employees as rows
                    return [4 /*yield*/, pool
                            .request()
                            .input('shiftId', shiftId)
                            .input('timesheetId', timesheetId)
                            .query(/* sql */ "\n      insert into ShiftLog.TimesheetRows (\n        instance,\n        timesheetId,\n        rowTitle,\n        employeeNumber\n      )\n      select\n        se.instance,\n        @timesheetId,\n        e.lastName + ', ' + e.firstName,\n        se.employeeNumber\n      from ShiftLog.ShiftEmployees se\n      inner join ShiftLog.Employees e\n        on se.instance = e.instance and se.employeeNumber = e.employeeNumber\n      where se.shiftId = @shiftId\n        and e.recordDelete_dateTime is null\n    ")
                        // Copy equipment as rows
                    ];
                case 3:
                    // Copy employees as rows
                    _a.sent();
                    // Copy equipment as rows
                    return [4 /*yield*/, pool
                            .request()
                            .input('shiftId', shiftId)
                            .input('timesheetId', timesheetId).query(/* sql */ "\n      insert into ShiftLog.TimesheetRows (\n        instance,\n        timesheetId,\n        rowTitle,\n        equipmentNumber\n      )\n      select\n        se.instance,\n        @timesheetId,\n        eq.equipmentName,\n        se.equipmentNumber\n      from ShiftLog.ShiftEquipment se\n      inner join ShiftLog.Equipment eq\n        on  se.instance = eq.instance and se.equipmentNumber = eq.equipmentNumber\n      where se.shiftId = @shiftId\n        and eq.recordDelete_dateTime is null\n    ")];
                case 4:
                    // Copy equipment as rows
                    _a.sent();
                    return [2 /*return*/, true];
            }
        });
    });
}
