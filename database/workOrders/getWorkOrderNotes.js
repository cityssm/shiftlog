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
exports.default = getWorkOrderNotes;
var config_helpers_js_1 = require("../../helpers/config.helpers.js");
var database_helpers_js_1 = require("../../helpers/database.helpers.js");
function getWorkOrderNotes(workOrderId) {
    return __awaiter(this, void 0, void 0, function () {
        var pool, notesResult, notes, fieldsResult, fieldsMap, _i, _a, field, _b, notes_1, note;
        var _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, (0, database_helpers_js_1.getShiftLogConnectionPool)()
                    // Get notes with note type information
                ];
                case 1:
                    pool = _e.sent();
                    return [4 /*yield*/, pool
                            .request()
                            .input('workOrderId', workOrderId)
                            .input('instance', (0, config_helpers_js_1.getConfigProperty)('application.instance'))
                            .query(/* sql */ "\n      SELECT\n        wn.workOrderId,\n        wn.noteSequence,\n        wn.noteTypeId,\n        nt.noteType,\n        wn.noteText,\n        wn.recordCreate_userName,\n        wn.recordCreate_dateTime,\n        wn.recordUpdate_userName,\n        wn.recordUpdate_dateTime,\n        wn.recordDelete_userName,\n        wn.recordDelete_dateTime\n      FROM\n        ShiftLog.WorkOrderNotes wn\n      LEFT JOIN\n        ShiftLog.NoteTypes nt ON wn.noteTypeId = nt.noteTypeId\n      WHERE\n        wn.workOrderId = @workOrderId\n        AND wn.recordDelete_dateTime IS NULL\n        AND wn.workOrderId IN (\n          SELECT\n            workOrderId\n          FROM\n            ShiftLog.WorkOrders\n          WHERE\n            recordDelete_dateTime IS NULL\n            AND instance = @instance\n        )\n      ORDER BY\n        wn.noteSequence DESC\n    ")];
                case 2:
                    notesResult = _e.sent();
                    notes = notesResult.recordset;
                    return [4 /*yield*/, pool
                            .request()
                            .input('workOrderId', workOrderId)
                            .query(/* sql */ "\n      SELECT\n        wnf.noteSequence,\n        wnf.noteTypeFieldId,\n        COALESCE(ntf.fieldLabel, 'Deleted Field') as fieldLabel,\n        COALESCE(ntf.fieldInputType, 'text') as fieldInputType,\n        ntf.fieldHelpText,\n        ntf.dataListKey,\n        ntf.fieldValueMin,\n        ntf.fieldValueMax,\n        COALESCE(ntf.fieldValueRequired, 0) as fieldValueRequired,\n        COALESCE(ntf.hasDividerAbove, 0) as hasDividerAbove,\n        ntf.orderNumber,\n        wnf.fieldValue\n      FROM\n        ShiftLog.WorkOrderNoteFields wnf\n      LEFT JOIN\n        ShiftLog.NoteTypeFields ntf ON wnf.noteTypeFieldId = ntf.noteTypeFieldId\n      WHERE\n        wnf.workOrderId = @workOrderId\n      ORDER BY\n        COALESCE(ntf.orderNumber, 999999), wnf.noteTypeFieldId\n    ")
                        // Group fields by note sequence
                    ];
                case 3:
                    fieldsResult = _e.sent();
                    fieldsMap = new Map();
                    for (_i = 0, _a = fieldsResult.recordset; _i < _a.length; _i++) {
                        field = _a[_i];
                        if (!fieldsMap.has(field.noteSequence)) {
                            fieldsMap.set(field.noteSequence, []);
                        }
                        (_c = fieldsMap.get(field.noteSequence)) === null || _c === void 0 ? void 0 : _c.push({
                            dataListKey: field.dataListKey,
                            fieldHelpText: field.fieldHelpText,
                            fieldInputType: field.fieldInputType,
                            fieldLabel: field.fieldLabel,
                            fieldValue: field.fieldValue,
                            fieldValueMax: field.fieldValueMax,
                            fieldValueMin: field.fieldValueMin,
                            fieldValueRequired: field.fieldValueRequired,
                            hasDividerAbove: field.hasDividerAbove,
                            noteTypeFieldId: field.noteTypeFieldId,
                            orderNumber: field.orderNumber
                        });
                    }
                    // Attach fields to notes
                    for (_b = 0, notes_1 = notes; _b < notes_1.length; _b++) {
                        note = notes_1[_b];
                        note.fields = (_d = fieldsMap.get(note.noteSequence)) !== null && _d !== void 0 ? _d : [];
                    }
                    return [2 /*return*/, notes];
            }
        });
    });
}
