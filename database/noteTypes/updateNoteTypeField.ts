import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

interface UpdateNoteTypeFieldForm {
  dataListKey?: string | null
  fieldHelpText: string
  fieldInputType: 'date' | 'number' | 'select' | 'text' | 'textbox'
  fieldLabel: string
  fieldUnitPrefix: string
  fieldUnitSuffix: string
  fieldValueMax?: number | null
  fieldValueMin?: number | null
  fieldValueRequired: boolean
  hasDividerAbove: boolean
  noteTypeFieldId: number
}

export default async function updateNoteTypeField(
  fieldFields: UpdateNoteTypeFieldForm,
  user: User
): Promise<boolean> {
  const currentDate = new Date()

  try {
    const pool = await getShiftLogConnectionPool()

    await pool
      .request()
      .input('noteTypeFieldId', fieldFields.noteTypeFieldId)
      .input('fieldLabel', fieldFields.fieldLabel)
      .input('fieldInputType', fieldFields.fieldInputType)
      .input('fieldUnitPrefix', fieldFields.fieldUnitPrefix)
      .input('fieldUnitSuffix', fieldFields.fieldUnitSuffix)
      .input('fieldHelpText', fieldFields.fieldHelpText)
      .input('dataListKey', fieldFields.dataListKey ?? null)
      .input('fieldValueMin', fieldFields.fieldValueMin ?? null)
      .input('fieldValueMax', fieldFields.fieldValueMax ?? null)
      .input('fieldValueRequired', fieldFields.fieldValueRequired)
      .input('hasDividerAbove', fieldFields.hasDividerAbove)
      .input('recordUpdate_userName', user.userName)
      .input('recordUpdate_dateTime', currentDate)
      .query(/* sql */ `
        UPDATE
          ShiftLog.NoteTypeFields
        SET
          fieldLabel = @fieldLabel,
          fieldInputType = @fieldInputType,
          fieldUnitPrefix = @fieldUnitPrefix,
          fieldUnitSuffix = @fieldUnitSuffix,
          fieldHelpText = @fieldHelpText,
          dataListKey = @dataListKey,
          fieldValueMin = @fieldValueMin,
          fieldValueMax = @fieldValueMax,
          fieldValueRequired = @fieldValueRequired,
          hasDividerAbove = @hasDividerAbove,
          recordUpdate_userName = @recordUpdate_userName,
          recordUpdate_dateTime = @recordUpdate_dateTime
        WHERE
          noteTypeFieldId = @noteTypeFieldId
          AND recordDelete_dateTime IS NULL
      `)

    return true
  } catch {
    return false
  }
}
