"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
var express_1 = require("express");
var crews_js_1 = require("../handlers/shifts-get/crews.js");
var edit_js_1 = require("../handlers/shifts-get/edit.js");
var new_js_1 = require("../handlers/shifts-get/new.js");
var print_js_1 = require("../handlers/shifts-get/print.js");
var recovery_js_1 = require("../handlers/shifts-get/recovery.js");
var search_js_1 = require("../handlers/shifts-get/search.js");
var view_js_1 = require("../handlers/shifts-get/view.js");
var doAddCrew_js_1 = require("../handlers/shifts-post/doAddCrew.js");
var doAddCrewEquipment_js_1 = require("../handlers/shifts-post/doAddCrewEquipment.js");
var doAddCrewMember_js_1 = require("../handlers/shifts-post/doAddCrewMember.js");
var doAddShiftCrew_js_1 = require("../handlers/shifts-post/doAddShiftCrew.js");
var doAddShiftEmployee_js_1 = require("../handlers/shifts-post/doAddShiftEmployee.js");
var doAddShiftEquipment_js_1 = require("../handlers/shifts-post/doAddShiftEquipment.js");
var doAddShiftWorkOrder_js_1 = require("../handlers/shifts-post/doAddShiftWorkOrder.js");
var doCopyFromPreviousShift_js_1 = require("../handlers/shifts-post/doCopyFromPreviousShift.js");
var doCreateShift_js_1 = require("../handlers/shifts-post/doCreateShift.js");
var doDeleteCrew_js_1 = require("../handlers/shifts-post/doDeleteCrew.js");
var doDeleteCrewEquipment_js_1 = require("../handlers/shifts-post/doDeleteCrewEquipment.js");
var doDeleteCrewMember_js_1 = require("../handlers/shifts-post/doDeleteCrewMember.js");
var doDeleteShift_js_1 = require("../handlers/shifts-post/doDeleteShift.js");
var doDeleteShiftCrew_js_1 = require("../handlers/shifts-post/doDeleteShiftCrew.js");
var doDeleteShiftEmployee_js_1 = require("../handlers/shifts-post/doDeleteShiftEmployee.js");
var doDeleteShiftEquipment_js_1 = require("../handlers/shifts-post/doDeleteShiftEquipment.js");
var doDeleteShiftWorkOrder_js_1 = require("../handlers/shifts-post/doDeleteShiftWorkOrder.js");
var doGetAvailableCrewsEmployeesEquipment_js_1 = require("../handlers/shifts-post/doGetAvailableCrewsEmployeesEquipment.js");
var doGetCrew_js_1 = require("../handlers/shifts-post/doGetCrew.js");
var doGetDeletedShifts_js_1 = require("../handlers/shifts-post/doGetDeletedShifts.js");
var doGetPreviousShifts_js_1 = require("../handlers/shifts-post/doGetPreviousShifts.js");
var doGetShiftCrews_js_1 = require("../handlers/shifts-post/doGetShiftCrews.js");
var doGetShiftEmployees_js_1 = require("../handlers/shifts-post/doGetShiftEmployees.js");
var doGetShiftEquipment_js_1 = require("../handlers/shifts-post/doGetShiftEquipment.js");
var doGetShiftWorkOrders_js_1 = require("../handlers/shifts-post/doGetShiftWorkOrders.js");
var doRecoverShift_js_1 = require("../handlers/shifts-post/doRecoverShift.js");
var doSearchShifts_js_1 = require("../handlers/shifts-post/doSearchShifts.js");
var doUpdateCrew_js_1 = require("../handlers/shifts-post/doUpdateCrew.js");
var doUpdateCrewEquipment_js_1 = require("../handlers/shifts-post/doUpdateCrewEquipment.js");
var doUpdateShift_js_1 = require("../handlers/shifts-post/doUpdateShift.js");
var doUpdateShiftCrewNote_js_1 = require("../handlers/shifts-post/doUpdateShiftCrewNote.js");
var doUpdateShiftEmployee_js_1 = require("../handlers/shifts-post/doUpdateShiftEmployee.js");
var doUpdateShiftEmployeeNote_js_1 = require("../handlers/shifts-post/doUpdateShiftEmployeeNote.js");
var doUpdateShiftEquipment_js_1 = require("../handlers/shifts-post/doUpdateShiftEquipment.js");
var doUpdateShiftEquipmentNote_js_1 = require("../handlers/shifts-post/doUpdateShiftEquipmentNote.js");
var doUpdateShiftWorkOrderNote_js_1 = require("../handlers/shifts-post/doUpdateShiftWorkOrderNote.js");
function updateHandler(request, response, next) {
    var _a, _b;
    if ((_b = (_a = request.session.user) === null || _a === void 0 ? void 0 : _a.userProperties.shifts.canUpdate) !== null && _b !== void 0 ? _b : false) {
        next();
    }
    else {
        response.status(403).send('Forbidden');
    }
}
function manageHandler(request, response, next) {
    var _a, _b;
    if ((_b = (_a = request.session.user) === null || _a === void 0 ? void 0 : _a.userProperties.shifts.canManage) !== null && _b !== void 0 ? _b : false) {
        next();
    }
    else {
        response.status(403).send('Forbidden');
    }
}
exports.router = (0, express_1.Router)();
exports.router.get('/', search_js_1.default).post('/doSearchShifts', doSearchShifts_js_1.default);
exports.router
    .get('/new', updateHandler, new_js_1.default)
    .post('/doCreateShift', updateHandler, doCreateShift_js_1.default);
exports.router
    .get('/:shiftId/edit', updateHandler, edit_js_1.default)
    .post('/doUpdateShift', updateHandler, doUpdateShift_js_1.default)
    .post('/doDeleteShift', updateHandler, doDeleteShift_js_1.default);
// Shift crews, employees, and equipment endpoints
exports.router.post('/doGetShiftCrews', doGetShiftCrews_js_1.default);
exports.router.post('/doGetShiftEmployees', doGetShiftEmployees_js_1.default);
exports.router.post('/doGetShiftEquipment', doGetShiftEquipment_js_1.default);
exports.router.post(
// eslint-disable-next-line no-secrets/no-secrets
'/doGetAvailableCrewsEmployeesEquipment', doGetAvailableCrewsEmployeesEquipment_js_1.default);
exports.router.post('/doAddShiftCrew', updateHandler, doAddShiftCrew_js_1.default);
exports.router.post('/doAddShiftEmployee', updateHandler, doAddShiftEmployee_js_1.default);
exports.router.post('/doAddShiftEquipment', updateHandler, doAddShiftEquipment_js_1.default);
exports.router.post('/doUpdateShiftEmployee', updateHandler, doUpdateShiftEmployee_js_1.default);
exports.router.post('/doUpdateShiftEquipment', updateHandler, doUpdateShiftEquipment_js_1.default);
exports.router.post('/doUpdateShiftCrewNote', updateHandler, doUpdateShiftCrewNote_js_1.default);
exports.router.post('/doUpdateShiftEmployeeNote', updateHandler, doUpdateShiftEmployeeNote_js_1.default);
exports.router.post('/doUpdateShiftEquipmentNote', updateHandler, doUpdateShiftEquipmentNote_js_1.default);
exports.router.post('/doDeleteShiftCrew', updateHandler, doDeleteShiftCrew_js_1.default);
exports.router.post('/doDeleteShiftEmployee', updateHandler, doDeleteShiftEmployee_js_1.default);
exports.router.post('/doDeleteShiftEquipment', updateHandler, doDeleteShiftEquipment_js_1.default);
// Shift work orders endpoints
exports.router.post('/doGetShiftWorkOrders', doGetShiftWorkOrders_js_1.default);
exports.router.post('/doAddShiftWorkOrder', updateHandler, doAddShiftWorkOrder_js_1.default);
exports.router.post('/doUpdateShiftWorkOrderNote', updateHandler, doUpdateShiftWorkOrderNote_js_1.default);
exports.router.post('/doDeleteShiftWorkOrder', updateHandler, doDeleteShiftWorkOrder_js_1.default);
exports.router.post('/doGetPreviousShifts', doGetPreviousShifts_js_1.default);
exports.router.post('/doCopyFromPreviousShift', updateHandler, doCopyFromPreviousShift_js_1.default);
// Crew maintenance endpoints
exports.router.get('/crews', updateHandler, crews_js_1.default);
exports.router.post('/doGetCrew', updateHandler, doGetCrew_js_1.default);
exports.router.post('/doAddCrew', updateHandler, doAddCrew_js_1.default);
exports.router.post('/doUpdateCrew', updateHandler, doUpdateCrew_js_1.default);
exports.router.post('/doDeleteCrew', updateHandler, doDeleteCrew_js_1.default);
exports.router.post('/doAddCrewMember', updateHandler, doAddCrewMember_js_1.default);
exports.router.post('/doDeleteCrewMember', updateHandler, doDeleteCrewMember_js_1.default);
exports.router.post('/doAddCrewEquipment', updateHandler, doAddCrewEquipment_js_1.default);
exports.router.post('/doUpdateCrewEquipment', updateHandler, doUpdateCrewEquipment_js_1.default);
exports.router.post('/doDeleteCrewEquipment', updateHandler, doDeleteCrewEquipment_js_1.default);
exports.router
    .get('/recovery', manageHandler, recovery_js_1.default)
    .post('/doGetDeletedShifts', manageHandler, doGetDeletedShifts_js_1.default)
    .post('/doRecoverShift', manageHandler, doRecoverShift_js_1.default);
exports.router.get('/:shiftId/print', print_js_1.default);
exports.router.get('/:shiftId', view_js_1.default);
exports.default = exports.router;
