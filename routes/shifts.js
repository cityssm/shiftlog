import { Router } from 'express';
import handler_builder from '../handlers/shifts-get/builder.js';
import handler_crews from '../handlers/shifts-get/crews.js';
import handler_edit from '../handlers/shifts-get/edit.js';
import handler_new from '../handlers/shifts-get/new.js';
import handler_print from '../handlers/shifts-get/print.js';
import handler_recovery from '../handlers/shifts-get/recovery.js';
import handler_search from '../handlers/shifts-get/search.js';
import handler_view from '../handlers/shifts-get/view.js';
import handler_doAddCrew from '../handlers/shifts-post/doAddCrew.js';
import handler_doAddCrewEquipment from '../handlers/shifts-post/doAddCrewEquipment.js';
import handler_doAddCrewMember from '../handlers/shifts-post/doAddCrewMember.js';
import handler_doAddShiftAdhocTask from '../handlers/shifts-post/doAddShiftAdhocTask.js';
import handler_doAddShiftCrew from '../handlers/shifts-post/doAddShiftCrew.js';
import handler_doAddShiftEmployee from '../handlers/shifts-post/doAddShiftEmployee.js';
import handler_doAddShiftEquipment from '../handlers/shifts-post/doAddShiftEquipment.js';
import handler_doAddShiftWorkOrder from '../handlers/shifts-post/doAddShiftWorkOrder.js';
import handler_doCopyFromPreviousShift from '../handlers/shifts-post/doCopyFromPreviousShift.js';
import handler_doCreateAdhocTask from '../handlers/shifts-post/doCreateAdhocTask.js';
import handler_doCreateShift from '../handlers/shifts-post/doCreateShift.js';
import handler_doCreateShiftNote from '../handlers/shifts-post/doCreateShiftNote.js';
import handler_doCreateStandaloneAdhocTask from '../handlers/shifts-post/doCreateStandaloneAdhocTask.js';
import handler_doDeleteCrew from '../handlers/shifts-post/doDeleteCrew.js';
import handler_doDeleteCrewEquipment from '../handlers/shifts-post/doDeleteCrewEquipment.js';
import handler_doDeleteCrewMember from '../handlers/shifts-post/doDeleteCrewMember.js';
import handler_doDeleteShift from '../handlers/shifts-post/doDeleteShift.js';
import handler_doDeleteShiftAdhocTask from '../handlers/shifts-post/doDeleteShiftAdhocTask.js';
import handler_doDeleteShiftCrew from '../handlers/shifts-post/doDeleteShiftCrew.js';
import handler_doDeleteShiftEmployee from '../handlers/shifts-post/doDeleteShiftEmployee.js';
import handler_doDeleteShiftEquipment from '../handlers/shifts-post/doDeleteShiftEquipment.js';
import handler_doDeleteShiftNote from '../handlers/shifts-post/doDeleteShiftNote.js';
import handler_doDeleteShiftWorkOrder from '../handlers/shifts-post/doDeleteShiftWorkOrder.js';
import handler_doGetAdhocTaskTypes from '../handlers/shifts-post/doGetAdhocTaskTypes.js';
import handler_doGetAvailableAdhocTasks from '../handlers/shifts-post/doGetAvailableAdhocTasks.js';
import handler_doGetAvailableCrewsEmployeesEquipment from '../handlers/shifts-post/doGetAvailableCrewsEmployeesEquipment.js';
import handler_doGetAvailableResources from '../handlers/shifts-post/doGetAvailableResources.js';
import handler_doGetCrew from '../handlers/shifts-post/doGetCrew.js';
import handler_doGetDeletedShifts from '../handlers/shifts-post/doGetDeletedShifts.js';
import handler_doGetEligibleEmployeesForEquipment from '../handlers/shifts-post/doGetEligibleEmployeesForEquipment.js';
import handler_doGetNoteTypes from '../handlers/shifts-post/doGetNoteTypes.js';
import handler_doGetPreviousShifts from '../handlers/shifts-post/doGetPreviousShifts.js';
import handler_doGetShiftAdhocTasks from '../handlers/shifts-post/doGetShiftAdhocTasks.js';
import handler_doGetShiftCreationData from '../handlers/shifts-post/doGetShiftCreationData.js';
import handler_doGetShiftCrews from '../handlers/shifts-post/doGetShiftCrews.js';
import handler_doGetShiftEmployees from '../handlers/shifts-post/doGetShiftEmployees.js';
import handler_doGetShiftEquipment from '../handlers/shifts-post/doGetShiftEquipment.js';
import handler_doGetShiftNotes from '../handlers/shifts-post/doGetShiftNotes.js';
import handler_doGetShiftsForBuilder from '../handlers/shifts-post/doGetShiftsForBuilder.js';
import handler_doGetShiftTimesheets from '../handlers/shifts-post/doGetShiftTimesheets.js';
import handler_doGetShiftWorkOrders from '../handlers/shifts-post/doGetShiftWorkOrders.js';
import handler_doRecoverShift from '../handlers/shifts-post/doRecoverShift.js';
import handler_doSearchShifts from '../handlers/shifts-post/doSearchShifts.js';
import handler_doUpdateAdhocTask from '../handlers/shifts-post/doUpdateAdhocTask.js';
import handler_doUpdateCrew from '../handlers/shifts-post/doUpdateCrew.js';
import handler_doUpdateCrewEquipment from '../handlers/shifts-post/doUpdateCrewEquipment.js';
import handler_doUpdateShift from '../handlers/shifts-post/doUpdateShift.js';
import handler_doUpdateShiftAdhocTaskNote from '../handlers/shifts-post/doUpdateShiftAdhocTaskNote.js';
import handler_doUpdateShiftCrewNote from '../handlers/shifts-post/doUpdateShiftCrewNote.js';
import handler_doUpdateShiftEmployee from '../handlers/shifts-post/doUpdateShiftEmployee.js';
import handler_doUpdateShiftEmployeeNote from '../handlers/shifts-post/doUpdateShiftEmployeeNote.js';
import handler_doUpdateShiftEquipment from '../handlers/shifts-post/doUpdateShiftEquipment.js';
import handler_doUpdateShiftEquipmentNote from '../handlers/shifts-post/doUpdateShiftEquipmentNote.js';
import handler_doUpdateShiftNote from '../handlers/shifts-post/doUpdateShiftNote.js';
import handler_doUpdateShiftWorkOrderNote from '../handlers/shifts-post/doUpdateShiftWorkOrderNote.js';
function updateHandler(request, response, next) {
    if (request.session.user?.userProperties.shifts.canUpdate ?? false) {
        next();
    }
    else {
        response.status(403).send('Forbidden');
    }
}
function manageHandler(request, response, next) {
    if (request.session.user?.userProperties.shifts.canManage ?? false) {
        next();
    }
    else {
        response.status(403).send('Forbidden');
    }
}
export const router = Router();
router.get('/', handler_search).post('/doSearchShifts', handler_doSearchShifts);
router
    .get('/builder', handler_builder)
    .post('/doGetShiftsForBuilder', handler_doGetShiftsForBuilder)
    .post('/doGetAvailableResources', handler_doGetAvailableResources)
    .post('/doGetShiftCreationData', handler_doGetShiftCreationData);
router
    .get('/new', updateHandler, handler_new)
    .post('/doCreateShift', updateHandler, handler_doCreateShift);
router
    .get('/:shiftId/edit', updateHandler, handler_edit)
    .post('/doUpdateShift', updateHandler, handler_doUpdateShift)
    .post('/doDeleteShift', updateHandler, handler_doDeleteShift);
// Shift notes endpoints
router
    .post('/:shiftId/doGetShiftNotes', handler_doGetShiftNotes)
    .post('/doGetNoteTypes', handler_doGetNoteTypes)
    .post('/doCreateShiftNote', updateHandler, handler_doCreateShiftNote)
    .post('/doUpdateShiftNote', updateHandler, handler_doUpdateShiftNote)
    .post('/doDeleteShiftNote', updateHandler, handler_doDeleteShiftNote);
// Shift crews, employees, and equipment endpoints
router
    .post('/doGetShiftCrews', handler_doGetShiftCrews)
    .post('/doGetShiftEmployees', handler_doGetShiftEmployees)
    .post('/doGetShiftEquipment', handler_doGetShiftEquipment)
    .post('/doGetShiftTimesheets', handler_doGetShiftTimesheets);
// Ignoring eslint-plugin-no-secrets false positive
router.post(
// eslint-disable-next-line no-secrets/no-secrets
'/doGetAvailableCrewsEmployeesEquipment', handler_doGetAvailableCrewsEmployeesEquipment);
router.post('/doGetEligibleEmployeesForEquipment', handler_doGetEligibleEmployeesForEquipment);
router
    .post('/doAddShiftCrew', updateHandler, handler_doAddShiftCrew)
    .post('/doAddShiftEmployee', updateHandler, handler_doAddShiftEmployee)
    .post('/doAddShiftEquipment', updateHandler, handler_doAddShiftEquipment);
router.post('/doUpdateShiftEmployee', updateHandler, handler_doUpdateShiftEmployee);
router.post('/doUpdateShiftEquipment', updateHandler, handler_doUpdateShiftEquipment);
router
    .post('/doUpdateShiftCrewNote', updateHandler, handler_doUpdateShiftCrewNote)
    .post('/doUpdateShiftEmployeeNote', updateHandler, handler_doUpdateShiftEmployeeNote)
    .post('/doUpdateShiftEquipmentNote', updateHandler, handler_doUpdateShiftEquipmentNote);
router
    .post('/doDeleteShiftCrew', updateHandler, handler_doDeleteShiftCrew)
    .post('/doDeleteShiftEmployee', updateHandler, handler_doDeleteShiftEmployee)
    .post('/doDeleteShiftEquipment', updateHandler, handler_doDeleteShiftEquipment);
// Shift work orders endpoints
router.post('/doGetShiftWorkOrders', handler_doGetShiftWorkOrders);
router.post('/doAddShiftWorkOrder', updateHandler, handler_doAddShiftWorkOrder);
router.post('/doUpdateShiftWorkOrderNote', updateHandler, handler_doUpdateShiftWorkOrderNote);
router.post('/doDeleteShiftWorkOrder', updateHandler, handler_doDeleteShiftWorkOrder);
// Shift ad hoc tasks endpoints
router
    .post('/doGetShiftAdhocTasks', handler_doGetShiftAdhocTasks)
    .post('/doGetAvailableAdhocTasks', handler_doGetAvailableAdhocTasks)
    .post('/doGetAdhocTaskTypes', handler_doGetAdhocTaskTypes)
    .post('/doCreateAdhocTask', updateHandler, handler_doCreateAdhocTask)
    .post('/doCreateStandaloneAdhocTask', updateHandler, handler_doCreateStandaloneAdhocTask)
    .post('/doUpdateAdhocTask', updateHandler, handler_doUpdateAdhocTask)
    .post('/doAddShiftAdhocTask', updateHandler, handler_doAddShiftAdhocTask)
    .post('/doUpdateShiftAdhocTaskNote', updateHandler, handler_doUpdateShiftAdhocTaskNote)
    .post('/doDeleteShiftAdhocTask', updateHandler, handler_doDeleteShiftAdhocTask);
router
    .post('/doGetPreviousShifts', handler_doGetPreviousShifts)
    .post('/doCopyFromPreviousShift', updateHandler, handler_doCopyFromPreviousShift);
// Crew maintenance endpoints
router
    .get('/crews', updateHandler, handler_crews)
    .post('/doGetCrew', updateHandler, handler_doGetCrew)
    .post('/doAddCrew', updateHandler, handler_doAddCrew)
    .post('/doUpdateCrew', updateHandler, handler_doUpdateCrew)
    .post('/doDeleteCrew', updateHandler, handler_doDeleteCrew)
    .post('/doAddCrewMember', updateHandler, handler_doAddCrewMember)
    .post('/doDeleteCrewMember', updateHandler, handler_doDeleteCrewMember)
    .post('/doAddCrewEquipment', updateHandler, handler_doAddCrewEquipment)
    .post('/doUpdateCrewEquipment', updateHandler, handler_doUpdateCrewEquipment)
    .post('/doDeleteCrewEquipment', updateHandler, handler_doDeleteCrewEquipment);
router
    .get('/recovery', manageHandler, handler_recovery)
    .post('/doGetDeletedShifts', manageHandler, handler_doGetDeletedShifts)
    .post('/doRecoverShift', manageHandler, handler_doRecoverShift);
router.get('/:shiftId/print', handler_print);
router.get('/:shiftId', handler_view);
export default router;
