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
        wnf.fieldValue
      FROM
        ShiftLog.WorkOrderNoteFields wnf
      LEFT JOIN
        ShiftLog.NoteTypeFields ntf ON wnf.noteTypeFieldId = ntf.noteTypeFieldId
      WHERE
        wnf.workOrderId = @workOrderId
      ORDER BY
        COALESCE(ntf.orderNumber, 999999), wnf.noteTypeFieldId
    `);
    // Group fields by note sequence
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
    // Attach fields to notes
    for (const note of notes) {
        note.fields = fieldsMap.get(note.noteSequence) ?? [];
    }
    return notes;
}
