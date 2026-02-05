import Debug from 'debug';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
const debug = Debug(`${DEBUG_NAMESPACE}:database:runConnectivityTest`);
export default async function runConnectivityTest() {
    try {
        const pool = await getShiftLogConnectionPool();
        const result = await pool.request().query(/* sql */ `
      SELECT
        1 AS test
    `);
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        return result.recordset.length === 1 && result.recordset[0].test === 1;
    }
    catch {
        debug('Database connectivity test failed');
        return false;
    }
}
export async function runConnectivityTestUntilSuccess() {
    let isConnected = false;
    // Try to connect every 5 seconds until successful
    while (!isConnected) {
        // eslint-disable-next-line no-await-in-loop
        isConnected = await runConnectivityTest();
        if (!isConnected) {
            debug('Database not yet available, retrying in 5 seconds...');
            // eslint-disable-next-line no-await-in-loop, promise/avoid-new
            await new Promise((resolve) => {
                setTimeout(resolve, 5000);
            });
        }
    }
}
