import { type NextFunction, type Request, type Response, Router } from 'express'

import handler_crews from '../handlers/shifts-get/crews.js'
import handler_edit from '../handlers/shifts-get/edit.js'
import handler_new from '../handlers/shifts-get/new.js'
import handler_print from '../handlers/shifts-get/print.js'
import handler_recovery from '../handlers/shifts-get/recovery.js'
import handler_search from '../handlers/shifts-get/search.js'
import handler_view from '../handlers/shifts-get/view.js'
import handler_doAddCrew from '../handlers/shifts-post/doAddCrew.js'
import handler_doAddCrewEquipment from '../handlers/shifts-post/doAddCrewEquipment.js'
import handler_doAddCrewMember from '../handlers/shifts-post/doAddCrewMember.js'
import handler_doAddShiftCrew from '../handlers/shifts-post/doAddShiftCrew.js'
import handler_doAddShiftEmployee from '../handlers/shifts-post/doAddShiftEmployee.js'
import handler_doAddShiftEquipment from '../handlers/shifts-post/doAddShiftEquipment.js'
import handler_doAddShiftWorkOrder from '../handlers/shifts-post/doAddShiftWorkOrder.js'
import handler_doCopyFromPreviousShift from '../handlers/shifts-post/doCopyFromPreviousShift.js'
import handler_doCreateShift from '../handlers/shifts-post/doCreateShift.js'
import handler_doDeleteCrew from '../handlers/shifts-post/doDeleteCrew.js'
import handler_doDeleteCrewEquipment from '../handlers/shifts-post/doDeleteCrewEquipment.js'
import handler_doDeleteCrewMember from '../handlers/shifts-post/doDeleteCrewMember.js'
import handler_doDeleteShift from '../handlers/shifts-post/doDeleteShift.js'
import handler_doDeleteShiftCrew from '../handlers/shifts-post/doDeleteShiftCrew.js'
import handler_doDeleteShiftEmployee from '../handlers/shifts-post/doDeleteShiftEmployee.js'
import handler_doDeleteShiftEquipment from '../handlers/shifts-post/doDeleteShiftEquipment.js'
import handler_doDeleteShiftWorkOrder from '../handlers/shifts-post/doDeleteShiftWorkOrder.js'
import handler_doGetAvailableCrewsEmployeesEquipment from '../handlers/shifts-post/doGetAvailableCrewsEmployeesEquipment.js'
import handler_doGetCrew from '../handlers/shifts-post/doGetCrew.js'
import handler_doGetDeletedShifts from '../handlers/shifts-post/doGetDeletedShifts.js'
import handler_doGetPreviousShifts from '../handlers/shifts-post/doGetPreviousShifts.js'
import handler_doGetShiftCrews from '../handlers/shifts-post/doGetShiftCrews.js'
import handler_doGetShiftEmployees from '../handlers/shifts-post/doGetShiftEmployees.js'
import handler_doGetShiftEquipment from '../handlers/shifts-post/doGetShiftEquipment.js'
import handler_doGetShiftWorkOrders from '../handlers/shifts-post/doGetShiftWorkOrders.js'
import handler_doRecoverShift from '../handlers/shifts-post/doRecoverShift.js'
import handler_doSearchShifts from '../handlers/shifts-post/doSearchShifts.js'
import handler_doUpdateCrew from '../handlers/shifts-post/doUpdateCrew.js'
import handler_doUpdateCrewEquipment from '../handlers/shifts-post/doUpdateCrewEquipment.js'
import handler_doUpdateShift from '../handlers/shifts-post/doUpdateShift.js'
import handler_doUpdateShiftCrewNote from '../handlers/shifts-post/doUpdateShiftCrewNote.js'
import handler_doUpdateShiftEmployee from '../handlers/shifts-post/doUpdateShiftEmployee.js'
import handler_doUpdateShiftEmployeeNote from '../handlers/shifts-post/doUpdateShiftEmployeeNote.js'
import handler_doUpdateShiftEquipment from '../handlers/shifts-post/doUpdateShiftEquipment.js'
import handler_doUpdateShiftEquipmentNote from '../handlers/shifts-post/doUpdateShiftEquipmentNote.js'
import handler_doUpdateShiftWorkOrderNote from '../handlers/shifts-post/doUpdateShiftWorkOrderNote.js'

function updateHandler(
  request: Request<unknown, unknown, unknown, { error?: string }>,
  response: Response,
  next: NextFunction
): void {
  if (request.session.user?.userProperties.shifts.canUpdate ?? false) {
    next()
  } else {
    response.status(403).send('Forbidden')
  }
}

function manageHandler(
  request: Request<unknown, unknown, unknown, { error?: string }>,
  response: Response,
  next: NextFunction
): void {
  if (request.session.user?.userProperties.shifts.canManage ?? false) {
    next()
  } else {
    response.status(403).send('Forbidden')
  }
}

export const router = Router()

router.get('/', handler_search).post('/doSearchShifts', handler_doSearchShifts)

router
  .get('/new', updateHandler, handler_new)
  .post('/doCreateShift', updateHandler, handler_doCreateShift)

router
  .get('/:shiftId/edit', updateHandler, handler_edit)
  .post('/doUpdateShift', updateHandler, handler_doUpdateShift)
  .post('/doDeleteShift', updateHandler, handler_doDeleteShift)

// Shift crews, employees, and equipment endpoints
router.post('/doGetShiftCrews', handler_doGetShiftCrews)
router.post('/doGetShiftEmployees', handler_doGetShiftEmployees)
router.post('/doGetShiftEquipment', handler_doGetShiftEquipment)

router.post(
  // eslint-disable-next-line no-secrets/no-secrets
  '/doGetAvailableCrewsEmployeesEquipment',
  handler_doGetAvailableCrewsEmployeesEquipment
)

router.post('/doAddShiftCrew', updateHandler, handler_doAddShiftCrew)
router.post('/doAddShiftEmployee', updateHandler, handler_doAddShiftEmployee)
router.post('/doAddShiftEquipment', updateHandler, handler_doAddShiftEquipment)

router.post(
  '/doUpdateShiftEmployee',
  updateHandler,
  handler_doUpdateShiftEmployee
)
router.post(
  '/doUpdateShiftEquipment',
  updateHandler,
  handler_doUpdateShiftEquipment
)

router.post(
  '/doUpdateShiftCrewNote',
  updateHandler,
  handler_doUpdateShiftCrewNote
)
router.post(
  '/doUpdateShiftEmployeeNote',
  updateHandler,
  handler_doUpdateShiftEmployeeNote
)
router.post(
  '/doUpdateShiftEquipmentNote',
  updateHandler,
  handler_doUpdateShiftEquipmentNote
)

router.post('/doDeleteShiftCrew', updateHandler, handler_doDeleteShiftCrew)
router.post(
  '/doDeleteShiftEmployee',
  updateHandler,
  handler_doDeleteShiftEmployee
)
router.post(
  '/doDeleteShiftEquipment',
  updateHandler,
  handler_doDeleteShiftEquipment
)

// Shift work orders endpoints
router.post('/doGetShiftWorkOrders', handler_doGetShiftWorkOrders)
router.post('/doAddShiftWorkOrder', updateHandler, handler_doAddShiftWorkOrder)
router.post(
  '/doUpdateShiftWorkOrderNote',
  updateHandler,
  handler_doUpdateShiftWorkOrderNote
)
router.post(
  '/doDeleteShiftWorkOrder',
  updateHandler,
  handler_doDeleteShiftWorkOrder
)

router.post(
  '/doGetPreviousShifts',
  handler_doGetPreviousShifts
)

router.post(
  '/doCopyFromPreviousShift',
  updateHandler,
  handler_doCopyFromPreviousShift
)

// Crew maintenance endpoints
router.get('/crews', updateHandler, handler_crews)
router.post('/doGetCrew', updateHandler, handler_doGetCrew)
router.post('/doAddCrew', updateHandler, handler_doAddCrew)
router.post('/doUpdateCrew', updateHandler, handler_doUpdateCrew)
router.post('/doDeleteCrew', updateHandler, handler_doDeleteCrew)
router.post('/doAddCrewMember', updateHandler, handler_doAddCrewMember)
router.post('/doDeleteCrewMember', updateHandler, handler_doDeleteCrewMember)
router.post('/doAddCrewEquipment', updateHandler, handler_doAddCrewEquipment)
router.post('/doUpdateCrewEquipment', updateHandler, handler_doUpdateCrewEquipment)
router.post('/doDeleteCrewEquipment', updateHandler, handler_doDeleteCrewEquipment)

router
  .get('/recovery', manageHandler, handler_recovery)
  .post('/doGetDeletedShifts', manageHandler, handler_doGetDeletedShifts)
  .post('/doRecoverShift', manageHandler, handler_doRecoverShift)

router.get('/:shiftId/print', handler_print)
router.get('/:shiftId', handler_view)

export default router
