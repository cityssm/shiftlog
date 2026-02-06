import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getNoteTypes() {
    const pool = await getShiftLogConnectionPool();
    // Get all note types
    const noteTypesResult = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .query(/* sql */ `
      SELECT
        nt.noteTypeId,
        nt.noteType,
        nt.userGroupId,
        ug.userGroupName,
        nt.isAvailableWorkOrders,
        nt.isAvailableShifts,
        nt.isAvailableTimesheets,
        nt.recordCreate_userName,
        nt.recordCreate_dateTime,
        nt.recordUpdate_userName,
        nt.recordUpdate_dateTime
      FROM
        ShiftLog.NoteTypes nt
      LEFT JOIN
        ShiftLog.UserGroups ug ON nt.userGroupId = ug.userGroupId
      WHERE
        nt.instance = @instance
        AND nt.recordDelete_dateTime IS NULL
      ORDER BY
        nt.noteType
    `);
    const noteTypes = noteTypesResult.recordset;
    // Get all fields for all note types
    const fieldsResult = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .query(/* sql */ `
      SELECT
        ntf.noteTypeFieldId,
        ntf.noteTypeId,
        ntf.fieldLabel,
        ntf.fieldInputType,
        ntf.fieldHelpText,
        ntf.dataListKey,
        ntf.fieldValueMin,
        ntf.fieldValueMax,
        ntf.fieldValueRequired,
        ntf.hasDividerAbove,
        ntf.orderNumber,
        ntf.recordCreate_userName,
        ntf.recordCreate_dateTime,
        ntf.recordUpdate_userName,
        ntf.recordUpdate_dateTime
      FROM
        ShiftLog.NoteTypeFields ntf
      INNER JOIN
        ShiftLog.NoteTypes nt ON ntf.noteTypeId = nt.noteTypeId
      WHERE
        nt.instance = @instance
        AND ntf.recordDelete_dateTime IS NULL
      ORDER BY
        ntf.orderNumber, ntf.noteTypeFieldId
    `);
    const fields = fieldsResult.recordset;
    // Group fields by noteTypeId
    const noteTypesWithFields = noteTypes.map((noteType) => ({
        ...noteType,
        fields: fields.filter((field) => field.noteTypeId === noteType.noteTypeId)
    }));
    return noteTypesWithFields;
}
