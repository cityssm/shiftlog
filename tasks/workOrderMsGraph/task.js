import { millisecondsInOneMinute, minutesToMillis, secondsToMillis } from '@cityssm/to-millis';
import Debug from 'debug';
import { asyncExitHook } from 'exit-hook';
import { clearIntervalAsync, setIntervalAsync } from 'set-interval-async/fixed';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { clearCacheByTableName } from '../../helpers/cache.helpers.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { checkEmail } from './checkEmail.task.js';
import { sendEmail } from './sendEmail.task.js';
const debug = Debug(`${DEBUG_NAMESPACE}:tasks.workOrderMsGraph`);
const checkEmailIntervalMillis = minutesToMillis(2);
const sendEmailIntervalMillis = secondsToMillis(30);
if (getConfigProperty('connectors.msGraph') !== undefined) {
    await checkEmail();
    const checkEmailInterval = setIntervalAsync(checkEmail, checkEmailIntervalMillis);
    const sendEmailInterval = setIntervalAsync(sendEmail, sendEmailIntervalMillis);
    asyncExitHook(async () => {
        await clearIntervalAsync(checkEmailInterval);
        await clearIntervalAsync(sendEmailInterval);
    }, {
        wait: millisecondsInOneMinute
    });
}
process.on('message', (message) => {
    if (message.messageType === 'clearCache' &&
        message.sourcePid !== process.pid) {
        debug(`Clearing cache: ${message.tableName}`);
        clearCacheByTableName(message.tableName, false);
    }
});
