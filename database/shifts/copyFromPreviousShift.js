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
exports.default = copyFromPreviousShift;
var mssql_multi_pool_1 = require("@cityssm/mssql-multi-pool");
var config_helpers_js_1 = require("../../helpers/config.helpers.js");
function copyFromPreviousShift(form, user) {
    return __awaiter(this, void 0, void 0, function () {
        var pool, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, mssql_multi_pool_1.default.connect((0, config_helpers_js_1.getConfigProperty)('connectors.shiftLog'))];
                case 1:
                    pool = _b.sent();
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 9, , 10]);
                    if (!form.copyCrews) return [3 /*break*/, 4];
                    return [4 /*yield*/, pool
                            .request()
                            .input('currentShiftId', form.currentShiftId)
                            .input('previousShiftId', form.previousShiftId)
                            .input('userName', user.userName).query(/* sql */ "\n          insert into ShiftLog.ShiftCrews (shiftId, crewId, shiftCrewNote)\n          select @currentShiftId, sc.crewId, sc.shiftCrewNote\n          from ShiftLog.ShiftCrews sc\n          inner join ShiftLog.Crews c on sc.crewId = c.crewId\n          where sc.shiftId = @previousShiftId\n            and c.recordDelete_dateTime is null\n            and (\n              c.userGroupId is null or c.userGroupId in (\n                select userGroupId\n                from ShiftLog.UserGroupMembers\n                where userName = @userName\n              )\n            )\n            and not exists (\n              select 1 from ShiftLog.ShiftCrews sc2\n              where sc2.shiftId = @currentShiftId and sc2.crewId = sc.crewId\n            )\n        ")];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    if (!form.copyEmployees) return [3 /*break*/, 6];
                    return [4 /*yield*/, pool
                            .request()
                            .input('currentShiftId', form.currentShiftId)
                            .input('previousShiftId', form.previousShiftId)
                            .input('userName', user.userName).query(/* sql */ "\n          insert into ShiftLog.ShiftEmployees (shiftId, instance, employeeNumber, crewId, shiftEmployeeNote)\n          select @currentShiftId, se.instance, se.employeeNumber, se.crewId, se.shiftEmployeeNote\n          from ShiftLog.ShiftEmployees se\n          inner join ShiftLog.Employees e on se.instance = e.instance and se.employeeNumber = e.employeeNumber\n          where se.shiftId = @previousShiftId\n            and e.recordDelete_dateTime is null\n            and (\n              e.userGroupId is null or e.userGroupId in (\n                select userGroupId\n                from ShiftLog.UserGroupMembers\n                where userName = @userName\n              )\n            )\n            and not exists (\n              select 1 from ShiftLog.ShiftEmployees se2\n              where se2.shiftId = @currentShiftId and se2.employeeNumber = se.employeeNumber\n            )\n        ")];
                case 5:
                    _b.sent();
                    _b.label = 6;
                case 6:
                    if (!form.copyEquipment) return [3 /*break*/, 8];
                    return [4 /*yield*/, pool
                            .request()
                            .input('currentShiftId', form.currentShiftId)
                            .input('previousShiftId', form.previousShiftId)
                            .input('userName', user.userName).query(/* sql */ "\n          insert into ShiftLog.ShiftEquipment (shiftId, instance, equipmentNumber, employeeNumber, shiftEquipmentNote)\n          select @currentShiftId, se.instance, se.equipmentNumber, se.employeeNumber, se.shiftEquipmentNote\n          from ShiftLog.ShiftEquipment se\n          inner join ShiftLog.Equipment eq on se.instance = eq.instance and se.equipmentNumber = eq.equipmentNumber\n          where se.shiftId = @previousShiftId\n            and eq.recordDelete_dateTime is null\n            and (\n              eq.userGroupId is null or eq.userGroupId in (\n                select userGroupId\n                from ShiftLog.UserGroupMembers\n                where userName = @userName\n              )\n            )\n            and not exists (\n              select 1 from ShiftLog.ShiftEquipment se2\n              where se2.shiftId = @currentShiftId and se2.equipmentNumber = se.equipmentNumber\n            )\n        ")];
                case 7:
                    _b.sent();
                    _b.label = 8;
                case 8: return [2 /*return*/, true];
                case 9:
                    _a = _b.sent();
                    return [2 /*return*/, false];
                case 10: return [2 /*return*/];
            }
        });
    });
}
