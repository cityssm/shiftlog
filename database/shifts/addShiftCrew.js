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
exports.default = addShiftCrew;
var mssql_multi_pool_1 = require("@cityssm/mssql-multi-pool");
var config_helpers_js_1 = require("../../helpers/config.helpers.js");
function addShiftCrew(form, user) {
    return __awaiter(this, void 0, void 0, function () {
        var pool, crewMembersResult, _i, _a, member, _b;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, mssql_multi_pool_1.default.connect((0, config_helpers_js_1.getConfigProperty)('connectors.shiftLog'))];
                case 1:
                    pool = _d.sent();
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 9, , 10]);
                    // Add the crew to the shift
                    return [4 /*yield*/, pool
                            .request()
                            .input('shiftId', form.shiftId)
                            .input('crewId', form.crewId)
                            .input('shiftCrewNote', (_c = form.shiftCrewNote) !== null && _c !== void 0 ? _c : '').query(/* sql */ "\n        insert into ShiftLog.ShiftCrews (shiftId, crewId, shiftCrewNote)\n        values (@shiftId, @crewId, @shiftCrewNote)\n      ")
                        // Get crew members
                    ];
                case 3:
                    // Add the crew to the shift
                    _d.sent();
                    return [4 /*yield*/, pool.request().input('crewId', form.crewId)
                            .query(/* sql */ "\n        select employeeNumber\n        from ShiftLog.CrewMembers\n        where crewId = @crewId\n      ")
                        // Add crew members to shift employees (if not already there)
                    ];
                case 4:
                    crewMembersResult = _d.sent();
                    _i = 0, _a = crewMembersResult.recordset;
                    _d.label = 5;
                case 5:
                    if (!(_i < _a.length)) return [3 /*break*/, 8];
                    member = _a[_i];
                    return [4 /*yield*/, pool
                            .request()
                            .input('shiftId', form.shiftId)
                            .input('instance', (0, config_helpers_js_1.getConfigProperty)('application.instance'))
                            .input('employeeNumber', member.employeeNumber)
                            .input('crewId', form.crewId).query(/* sql */ "\n          if not exists (\n            select 1 from ShiftLog.ShiftEmployees\n            where shiftId = @shiftId and employeeNumber = @employeeNumber\n          )\n          begin\n            insert into ShiftLog.ShiftEmployees (shiftId, instance, employeeNumber, crewId, shiftEmployeeNote)\n            values (@shiftId, @instance, @employeeNumber, @crewId, '')\n          end\n        ")];
                case 6:
                    _d.sent();
                    _d.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 5];
                case 8: return [2 /*return*/, true];
                case 9:
                    _b = _d.sent();
                    return [2 /*return*/, false];
                case 10: return [2 /*return*/];
            }
        });
    });
}
