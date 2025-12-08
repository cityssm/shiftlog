// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable unicorn/no-null */

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

import updateWorkOrderTypeDefaultMilestones, {
  type DefaultMilestoneUpdate
} from './updateWorkOrderTypeDefaultMilestones.js'

export interface UpdateWorkOrderTypeForm {
  defaultMilestones?: string
  dueDays?: number | string
  moreInfoFormNames?: string | string[]
  userGroupId?: number | string
  workOrderNumberPrefix?: string
  workOrderType: string
  workOrderTypeId: number | string
}

export default async function updateWorkOrderType(
  form: UpdateWorkOrderTypeForm,
  userName: string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('workOrderTypeId', form.workOrderTypeId)
    .input('workOrderType', form.workOrderType)
    .input('workOrderNumberPrefix', form.workOrderNumberPrefix ?? '')
    .input(
      'dueDays',
      form.dueDays === '' || form.dueDays === undefined
        ? null
        : form.dueDays
    )
    .input(
      'userGroupId',
      form.userGroupId === '' ? null : (form.userGroupId ?? null)
    )
    .input('userName', userName).query(/* sql */ `
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
    `)

  if (result.rowsAffected[0] === 0) {
    return false
  }

  // Update moreInfoFormNames
  // First, delete existing form associations
  await pool.request().input('workOrderTypeId', form.workOrderTypeId)
    .query(/* sql */ `
      delete from ShiftLog.WorkOrderTypeMoreInfoForms
      where workOrderTypeId = @workOrderTypeId
    `)

  // Then, insert new form associations
  let formNames: string[] = []
  if (form.moreInfoFormNames !== undefined) {
    formNames = Array.isArray(form.moreInfoFormNames)
      ? form.moreInfoFormNames
      : [form.moreInfoFormNames]
  }

  for (const formName of formNames) {
    if (formName.trim() !== '') {
      await pool
        .request()
        .input('workOrderTypeId', form.workOrderTypeId)
        .input('formName', formName.trim()).query(/* sql */ `
          insert into ShiftLog.WorkOrderTypeMoreInfoForms (workOrderTypeId, formName)
          values (@workOrderTypeId, @formName)
        `)
    }
  }

  // Update default milestones
  if (form.defaultMilestones !== undefined) {
    const milestones: DefaultMilestoneUpdate[] = JSON.parse(
      form.defaultMilestones
    )
    const workOrderTypeId =
      typeof form.workOrderTypeId === 'string'
        ? Number.parseInt(form.workOrderTypeId, 10)
        : form.workOrderTypeId

    await updateWorkOrderTypeDefaultMilestones(workOrderTypeId, milestones)
  }

  return true
}
