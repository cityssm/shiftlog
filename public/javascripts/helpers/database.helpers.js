import mssqlMultiPool from '@cityssm/mssql-multi-pool';
import { getConfigProperty } from './config.helpers.js';
export async function getShiftLogConnectionPool() {
    const pool = await mssqlMultiPool.connect(getConfigProperty('connectors.shiftLog'));
    return pool;
}
