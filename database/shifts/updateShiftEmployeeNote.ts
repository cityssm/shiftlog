import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export interface UpdateShiftEmployeeNoteForm {
  shiftId: number | string
  employeeNumber: string
  shiftEmployeeNote: string
}

export default async function updateShiftEmployeeNote(
  form: UpdateShiftEmployeeNoteForm
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  try {
    await pool
      .request()
      .input('shiftId', form.shiftId)
      .input('employeeNumber', form.employeeNumber)
      .input('shiftEmployeeNote', form.shiftEmployeeNote)
      .query(/* sql */ `
        UPDATE ShiftLog.ShiftEmployees
        SET
          shiftEmployeeNote = @shiftEmployeeNote
        WHERE
          shiftId = @shiftId
          AND employeeNumber = @employeeNumber
      `)

    return true
  } catch {
    return false
  }
}
