import mssqlMultiPool from '@cityssm/mssql-multi-pool';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function getEmployees() {
    const employeeConfig = getConfigProperty('employees');
    if (employeeConfig.syncSource !== 'sql') {
        return undefined;
    }
    const sqlConfig = getConfigProperty('connectors.employeeSync');
    if (sqlConfig === undefined) {
        return undefined;
    }
    const pool = await mssqlMultiPool.connect(sqlConfig);
    const sqlEmployees = await pool
        .request()
        .query(employeeConfig.sql);
    return sqlEmployees.recordset;
}
