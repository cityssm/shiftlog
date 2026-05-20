import { clearCacheByTableName } from '../../helpers/cache.helpers.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function updateTagAlias(updateTagAliasForm, user) {
    const currentDate = new Date();
    try {
        const pool = await getShiftLogConnectionPool();
        const result = await pool
            .request()
            .input('instance', getConfigProperty('application.instance'))
            .input('oldTagNameAlias', updateTagAliasForm.oldTagNameAlias)
            .input('tagNameAlias', updateTagAliasForm.tagNameAlias)
            .input('tagName', updateTagAliasForm.tagName)
            .input('recordUpdate_userName', user.userName)
            .input('recordUpdate_dateTime', currentDate)
            .query(`
        UPDATE ShiftLog.TagAliases
        SET
          tagNameAlias = @tagNameAlias,
          tagName = @tagName,
          recordUpdate_userName = @recordUpdate_userName,
          recordUpdate_dateTime = @recordUpdate_dateTime
        WHERE
          tagNameAlias = @oldTagNameAlias
          AND instance = @instance
          AND recordDelete_dateTime IS NULL
      `);
        clearCacheByTableName('TagAliases');
        return result.rowsAffected[0] > 0;
    }
    catch {
        return false;
    }
}
