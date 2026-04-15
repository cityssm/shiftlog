import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
import updateWorkOrderTypeDefaultMilestones from './updateWorkOrderTypeDefaultMilestones.js';
export default async function updateWorkOrderType(form, userName) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('workOrderTypeId', form.workOrderTypeId)
        .input('workOrderType', form.workOrderType)
        .input('workOrderNumberPrefix', form.workOrderNumberPrefix ?? '')
        .input('dueDays', form.dueDays === '' || form.dueDays === undefined ? null : form.dueDays)
        .input('userGroupId', form.userGroupId === '' ? null : (form.userGroupId ?? null))
        .input('userName', userName).query(`
      update ShiftLog.WorkOrderTypes
      set
        workOrderType = @workOrderType,
        workOrderNumberPrefix = @workOrderNumberPrefix,
        dueDays = @dueDays,
        userGroupId = @userGroupId,
        recordUpdate_userName = @userName,
        recordUpdate_dateTime = getdate()
      where instance = @instance
        and workOrderTypeId = @workOrderTypeId
        and recordDelete_dateTime is null
    `);
    if (result.rowsAffected[0] === 0) {
        return false;
    }
    await pool.request().input('workOrderTypeId', form.workOrderTypeId)
        .query(`
      delete from ShiftLog.WorkOrderTypeMoreInfoForms
      where workOrderTypeId = @workOrderTypeId
    `);
    let formNames = [];
    if (form.moreInfoFormNames !== undefined) {
        formNames = Array.isArray(form.moreInfoFormNames)
            ? form.moreInfoFormNames
            : [form.moreInfoFormNames];
    }
    for (const formName of formNames) {
        if (formName.trim() !== '') {
            await pool
                .request()
                .input('workOrderTypeId', form.workOrderTypeId)
                .input('formName', formName.trim()).query(`
          insert into ShiftLog.WorkOrderTypeMoreInfoForms (workOrderTypeId, formName)
          values (@workOrderTypeId, @formName)
        `);
        }
    }
    if (form.defaultMilestones !== undefined) {
        const milestones = JSON.parse(form.defaultMilestones);
        const workOrderTypeId = typeof form.workOrderTypeId === 'string'
            ? Number.parseInt(form.workOrderTypeId, 10)
            : form.workOrderTypeId;
        await updateWorkOrderTypeDefaultMilestones(workOrderTypeId, milestones);
    }
    return true;
}
