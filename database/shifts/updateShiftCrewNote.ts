import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

interface UpdateShiftCrewNoteForm {
  shiftId: number | string
  crewId: number | string
  shiftCrewNote: string
}

export default async function updateShiftCrewNote(
  form: UpdateShiftCrewNoteForm
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  try {
    await pool
      .request()
      .input('shiftId', form.shiftId)
      .input('crewId', form.crewId)
      .input('shiftCrewNote', form.shiftCrewNote)
      .query(/* sql */ `
        UPDATE ShiftLog.ShiftCrews
        SET
          shiftCrewNote = @shiftCrewNote
        WHERE
          shiftId = @shiftId
          AND crewId = @crewId
      `)

    return true
  } catch {
    return false
  }
}
