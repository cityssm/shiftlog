import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function addNoteTypeField(fieldFields, user) {
    const currentDate = new Date();
    try {
        const pool = await getShiftLogConnectionPool();
        await pool
            .request()
            .input('noteTypeId', fieldFields.noteTypeId)
            .input('fieldLabel', fieldFields.fieldLabel)
            .input('fieldInputType', fieldFields.fieldInputType)
            .input('fieldHelpText', fieldFields.fieldHelpText)
            .input('dataListKey', fieldFields.dataListKey ?? null)
            .input('fieldValueMin', fieldFields.fieldValueMin ?? null)
            .input('fieldValueMax', fieldFields.fieldValueMax ?? null)
            .input('fieldValueRequired', fieldFields.fieldValueRequired)
            .input('hasDividerAbove', fieldFields.hasDividerAbove)
            .input('recordCreate_userName', user.userName)
            .input('recordCreate_dateTime', currentDate)
            .input('recordUpdate_userName', user.userName)
            .input('recordUpdate_dateTime', currentDate)
            .query(/* sql */ `
        INSERT INTO
          ShiftLog.NoteTypeFields (
            noteTypeId,
            fieldLabel,
            fieldInputType,
            fieldHelpText,
            dataListKey,
            fieldValueMin,
            fieldValueMax,
            fieldValueRequired,
            hasDividerAbove,
            recordCreate_userName,
            recordCreate_dateTime,
            recordUpdate_userName,
            recordUpdate_dateTime
          )
        VALUES
          (
            @noteTypeId,
            @fieldLabel,
            @fieldInputType,
            @fieldHelpText,
            @dataListKey,
            @fieldValueMin,
            @fieldValueMax,
            @fieldValueRequired,
            @hasDividerAbove,
            @recordCreate_userName,
            @recordCreate_dateTime,
            @recordUpdate_userName,
            @recordUpdate_dateTime
          )
      `);
        return true;
    }
    catch {
        return false;
    }
}
