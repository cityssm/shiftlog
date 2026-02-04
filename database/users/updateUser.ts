import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export interface UpdateUserForm {
  userName: string

  isActive: boolean

  shifts_canManage: boolean
  shifts_canUpdate: boolean
  shifts_canView: boolean

  workOrders_canManage: boolean
  workOrders_canUpdate: boolean
  workOrders_canView: boolean

  timesheets_canManage: boolean
  timesheets_canUpdate: boolean
  timesheets_canView: boolean

  isAdmin: boolean
}

export default async function updateUser(
  updateForm: UpdateUserForm,
  user: User
): Promise<boolean> {
  const currentDate = new Date()
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('userName', updateForm.userName)
    .input('isActive', updateForm.isActive ? 1 : 0)
    .input('shifts_canView', updateForm.shifts_canView ? 1 : 0)
    .input('shifts_canUpdate', updateForm.shifts_canUpdate ? 1 : 0)
    .input('shifts_canManage', updateForm.shifts_canManage ? 1 : 0)
    .input('workOrders_canView', updateForm.workOrders_canView ? 1 : 0)
    .input('workOrders_canUpdate', updateForm.workOrders_canUpdate ? 1 : 0)
    .input('workOrders_canManage', updateForm.workOrders_canManage ? 1 : 0)
    .input('timesheets_canView', updateForm.timesheets_canView ? 1 : 0)
    .input('timesheets_canUpdate', updateForm.timesheets_canUpdate ? 1 : 0)
    .input('timesheets_canManage', updateForm.timesheets_canManage ? 1 : 0)
    .input('isAdmin', updateForm.isAdmin ? 1 : 0)
    .input('recordUpdate_userName', user.userName)
    .input('recordUpdate_dateTime', currentDate)
    .query(/* sql */ `
      UPDATE ShiftLog.Users
      SET
        isActive = @isActive,
        shifts_canView = @shifts_canView,
        shifts_canUpdate = @shifts_canUpdate,
        shifts_canManage = @shifts_canManage,
        workOrders_canView = @workOrders_canView,
        workOrders_canUpdate = @workOrders_canUpdate,
        workOrders_canManage = @workOrders_canManage,
        timesheets_canView = @timesheets_canView,
        timesheets_canUpdate = @timesheets_canUpdate,
        timesheets_canManage = @timesheets_canManage,
        isAdmin = @isAdmin,
        recordUpdate_userName = @recordUpdate_userName,
        recordUpdate_dateTime = @recordUpdate_dateTime
      WHERE
        instance = @instance
        AND userName = @userName
        AND recordDelete_dateTime IS NULL
    `)

  return result.rowsAffected[0] > 0
}
