import mssqlPool from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'

interface UpdateShiftEquipmentForm {
  shiftId: number | string
  equipmentNumber: string
  employeeNumber?: string | null
}

export default async function updateShiftEquipment(
  form: UpdateShiftEquipmentForm
): Promise<boolean> {
  const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'))

  try {
    await pool
      .request()
      .input('shiftId', form.shiftId)
      .input('equipmentNumber', form.equipmentNumber)
      .input('employeeNumber', (form.employeeNumber ?? '') === '' ? null : form.employeeNumber).query(/* sql */ `
        update ShiftLog.ShiftEquipment
        set employeeNumber = @employeeNumber
        where shiftId = @shiftId and equipmentNumber = @equipmentNumber
      `)

    return true
  } catch {
    return false
  }
}
