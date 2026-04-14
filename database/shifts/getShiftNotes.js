import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getShiftNotes(shiftId) {
    const pool = await getShiftLogConnectionPool();
    const notesResult = await pool
        .request()
        .input('shiftId', shiftId)
        .input('instance', getConfigProperty('application.instance'))
        .query(`
      SELECT
        sn.shiftId,
        sn.noteSequence,
        sn.noteTypeId,
        nt.noteType,
        sn.noteText,
        sn.recordCreate_userName,
        sn.recordCreate_dateTime,
        sn.recordUpdate_userName,
        sn.recordUpdate_dateTime,
        sn.recordDelete_userName,
        sn.recordDelete_dateTime
      FROM
        ShiftLog.ShiftNotes sn
      LEFT JOIN
        ShiftLog.NoteTypes nt ON sn.noteTypeId = nt.noteTypeId
      WHERE
        sn.shiftId = @shiftId
        AND sn.recordDelete_dateTime IS NULL
        AND sn.shiftId IN (
          SELECT
            shiftId
          FROM
            ShiftLog.Shifts
          WHERE
            recordDelete_dateTime IS NULL
            AND instance = @instance
        )
      ORDER BY
        sn.noteSequence DESC
    `);
    const notes = notesResult.recordset;
    const fieldsResult = await pool
        .request()
        .input('shiftId', shiftId)
        .query(`
      SELECT
        snf.noteSequence,
        snf.noteTypeFieldId,
        COALESCE(ntf.fieldLabel, 'Deleted Field') as fieldLabel,
        COALESCE(ntf.fieldInputType, 'text') as fieldInputType,
        COALESCE(ntf.fieldUnitPrefix, '') as fieldUnitPrefix,
        COALESCE(ntf.fieldUnitSuffix, '') as fieldUnitSuffix,
        ntf.fieldHelpText,
        ntf.dataListKey,
        ntf.fieldValueMin,
        ntf.fieldValueMax,
        COALESCE(ntf.fieldValueRequired, 0) as fieldValueRequired,
        COALESCE(ntf.hasDividerAbove, 0) as hasDividerAbove,
        ntf.orderNumber,
        snf.fieldValue
      FROM
        ShiftLog.ShiftNoteFields snf
      LEFT JOIN
        ShiftLog.NoteTypeFields ntf ON snf.noteTypeFieldId = ntf.noteTypeFieldId
      WHERE
        snf.shiftId = @shiftId
      ORDER BY
        COALESCE(ntf.orderNumber, 999999), snf.noteTypeFieldId
    `);
    const fieldsMap = new Map();
    for (const field of fieldsResult.recordset) {
        if (!fieldsMap.has(field.noteSequence)) {
            fieldsMap.set(field.noteSequence, []);
        }
        fieldsMap.get(field.noteSequence)?.push({
            dataListKey: field.dataListKey,
            fieldHelpText: field.fieldHelpText,
            fieldInputType: field.fieldInputType,
            fieldLabel: field.fieldLabel,
            fieldUnitPrefix: field.fieldUnitPrefix,
            fieldUnitSuffix: field.fieldUnitSuffix,
            fieldValue: field.fieldValue,
            fieldValueMax: field.fieldValueMax,
            fieldValueMin: field.fieldValueMin,
            fieldValueRequired: field.fieldValueRequired,
            hasDividerAbove: field.hasDividerAbove,
            noteTypeFieldId: field.noteTypeFieldId,
            orderNumber: field.orderNumber
        });
    }
    for (const note of notes) {
        note.fields = fieldsMap.get(note.noteSequence) ?? [];
    }
    return notes;
}
