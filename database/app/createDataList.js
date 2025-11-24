import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function createDataList(form, userName) {
    const pool = await getShiftLogConnectionPool();
    try {
        await pool
            .request()
            .input('dataListKey', form.dataListKey)
            .input('dataListName', form.dataListName)
            .input('isSystemList', form.isSystemList)
            .input('userName', userName).query(/* sql */ `
        insert into ShiftLog.DataLists (
          dataListKey, dataListName, isSystemList,
          recordCreate_userName, recordUpdate_userName
        )
        values (
          @dataListKey, @dataListName, @isSystemList,
          @userName, @userName
        )
      `);
        return true;
    }
    catch {
        return false;
    }
}
