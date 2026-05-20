import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getTagAliases() {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .query(`
      SELECT
        tagNameAlias,
        tagName,
        recordCreate_userName,
        recordCreate_dateTime,
        recordUpdate_userName,
        recordUpdate_dateTime
      FROM
        ShiftLog.TagAliases
      WHERE
        instance = @instance
        AND recordDelete_dateTime IS NULL
      ORDER BY
        tagNameAlias
    `);
    return result.recordset;
}
