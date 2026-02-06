import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getWorkOrderNotes(workOrderId) {
    const pool = await getShiftLogConnectionPool();
    // Get notes with note type information
    const notesResult = await pool
        .request()
        .input('workOrderId', workOrderId)
        .input('instance', getConfigProperty('application.instance'))
        .query(/* sql */ `
      SELECT
        wn.workOrderId,
        wn.noteSequence,
        wn.noteTypeId,
        nt.noteType,
        wn.noteText,
        wn.recordCreate_userName,
        wn.recordCreate_dateTime,
        wn.recordUpdate_userName,
        wn.recordUpdate_dateTime,
        wn.recordDelete_userName,
        wn.recordDelete_dateTime
      FROM
        ShiftLog.WorkOrderNotes wn
      LEFT JOIN
        ShiftLog.NoteTypes nt ON wn.noteTypeId = nt.noteTypeId
      WHERE
        wn.workOrderId = @workOrderId
        AND wn.recordDelete_dateTime IS NULL
        AND wn.workOrderId IN (
          SELECT
            workOrderId
          FROM
            ShiftLog.WorkOrders
          WHERE
            recordDelete_dateTime IS NULL
            AND instance = @instance
        )
      ORDER BY
        wn.noteSequence DESC
    `);
    const notes = notesResult.recordset;
    // Get all field values for these notes
    const fieldsResult = await pool
        .request()
        .input('workOrderId', workOrderId)
        .query(/* sql */ `
      SELECT
        wnf.noteSequence,
        wnf.noteTypeFieldId,
        ntf.fieldLabel,
        ntf.fieldInputType,
        wnf.fieldValue
      FROM
        ShiftLog.WorkOrderNoteFields wnf
      INNER JOIN
        ShiftLog.NoteTypeFields ntf ON wnf.noteTypeFieldId = ntf.noteTypeFieldId
      WHERE
        wnf.workOrderId = @workOrderId
      ORDER BY
        ntf.orderNumber
    `);
    // Group fields by note sequence
    const fieldsMap = new Map();
    for (const field of fieldsResult.recordset) {
        if (!fieldsMap.has(field.noteSequence)) {
            fieldsMap.set(field.noteSequence, []);
        }
        fieldsMap.get(field.noteSequence)?.push({
            noteTypeFieldId: field.noteTypeFieldId,
            fieldLabel: field.fieldLabel,
            fieldInputType: field.fieldInputType,
            fieldValue: field.fieldValue
        });
    }
    // Attach fields to notes
    for (const note of notes) {
        note.fields = fieldsMap.get(note.noteSequence) ?? [];
    }
    return notes;
}
