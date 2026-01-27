import mssqlPool from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'

export interface UpdateShiftEquipmentNoteForm {
  shiftId: number | string
  equipmentNumber: string
  shiftEquipmentNote: string
}

export default async function updateShiftEquipmentNote(
  form: UpdateShiftEquipmentNoteForm
): Promise<boolean> {
  const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'))

  try {
    await pool
      .request()
      .input('shiftId', form.shiftId)
      .input('equipmentNumber', form.equipmentNumber)
      .input('shiftEquipmentNote', form.shiftEquipmentNote)
      .query(/* sql */ `
        UPDATE ShiftLog.ShiftEquipment
        SET
          shiftEquipmentNote = @shiftEquipmentNote
        WHERE
          shiftId = @shiftId
          AND equipmentNumber = @equipmentNumber
      `)

    return true
  } catch {
    return false
  }
}
