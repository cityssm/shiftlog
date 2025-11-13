import mssqlPool from '@cityssm/mssql-multi-pool';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function updateUser(updateForm, user) {
    const currentDate = new Date();
    const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
    const result = await pool
        .request()
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
        .input('recordUpdate_dateTime', currentDate).query(/* sql */ `
      update ShiftLog.Users
      set isActive = @isActive,
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
      where userName = @userName
        and recordDelete_dateTime is null
    `);
    return result.rowsAffected[0] > 0;
}
