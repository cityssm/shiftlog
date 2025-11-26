import mssqlPool from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'

interface UpdateShiftCrewNoteForm {
  shiftId: number | string
  crewId: number | string
  shiftCrewNote: string
}

export default async function updateShiftCrewNote(
  form: UpdateShiftCrewNoteForm
): Promise<boolean> {
  const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'))

  try {
    await pool
      .request()
      .input('shiftId', form.shiftId)
      .input('crewId', form.crewId)
      .input('shiftCrewNote', form.shiftCrewNote).query(/* sql */ `
        update ShiftLog.ShiftCrews
        set shiftCrewNote = @shiftCrewNote
        where shiftId = @shiftId
          and crewId = @crewId
      `)

    return true
  } catch {
    return false
  }
}
