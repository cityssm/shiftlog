import mssqlPool from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'

export interface UpdateShiftEmployeeNoteForm {
  shiftId: number | string
  employeeNumber: string
  shiftEmployeeNote: string
}

export default async function updateShiftEmployeeNote(
  form: UpdateShiftEmployeeNoteForm
): Promise<boolean> {
  const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'))

  try {
    await pool
      .request()
      .input('shiftId', form.shiftId)
      .input('employeeNumber', form.employeeNumber)
      .input('shiftEmployeeNote', form.shiftEmployeeNote).query(/* sql */ `
        update ShiftLog.ShiftEmployees
        set shiftEmployeeNote = @shiftEmployeeNote
        where shiftId = @shiftId
          and employeeNumber = @employeeNumber
      `)

    return true
  } catch {
    return false
  }
}
