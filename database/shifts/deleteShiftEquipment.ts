import mssqlPool from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'

interface DeleteShiftEquipmentForm {
  shiftId: number | string
  equipmentNumber: string
}

export default async function deleteShiftEquipment(
  form: DeleteShiftEquipmentForm
): Promise<boolean> {
  const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'))

  try {
    await pool
      .request()
      .input('shiftId', form.shiftId)
      .input('equipmentNumber', form.equipmentNumber).query(/* sql */ `
        delete from ShiftLog.ShiftEquipment
        where shiftId = @shiftId and equipmentNumber = @equipmentNumber
      `)

    return true
  } catch {
    return false
  }
}
