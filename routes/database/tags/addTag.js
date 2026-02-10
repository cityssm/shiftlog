import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function addTag(tagFields, user) {
    const currentDate = new Date();
    try {
        const pool = await getShiftLogConnectionPool();
        await pool
            .request()
            .input('instance', getConfigProperty('application.instance'))
            .input('tagName', tagFields.tagName)
            .input('tagBackgroundColor', tagFields.tagBackgroundColor)
            .input('tagTextColor', tagFields.tagTextColor)
            .input('recordCreate_userName', user.userName)
            .input('recordCreate_dateTime', currentDate)
            .input('recordUpdate_userName', user.userName)
            .input('recordUpdate_dateTime', currentDate)
            .query(/* sql */ `
        INSERT INTO
          ShiftLog.Tags (
            instance,
            tagName,
            tagBackgroundColor,
            tagTextColor,
            recordCreate_userName,
            recordCreate_dateTime,
            recordUpdate_userName,
            recordUpdate_dateTime
          )
        VALUES
          (
            @instance,
            @tagName,
            @tagBackgroundColor,
            @tagTextColor,
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
