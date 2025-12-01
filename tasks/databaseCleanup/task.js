// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ScheduledTask } from '@cityssm/scheduled-task';
import { daysToMillis } from '@cityssm/to-millis';
import Debug from 'debug';
import permanentlyDeleteRecords from '../../database/cleanup/permanentlyDeleteRecords.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
const debug = Debug(`${DEBUG_NAMESPACE}:tasks:databaseCleanup`);
async function runCleanup() {
    debug('Running database cleanup task');
    try {
        const result = await permanentlyDeleteRecords();
        if (result.success) {
            debug(`Database cleanup completed successfully. Deleted ${result.deletedCount} records.`);
            if (result.errors.length > 0) {
                debug(`Cleanup completed with ${result.errors.length} non-critical errors:`);
                for (const error of result.errors) {
                    debug(`  - ${error}`);
                }
            }
        }
        else {
            debug('Database cleanup failed');
            for (const error of result.errors) {
                debug(`  - ${error}`);
            }
        }
    }
    catch (error) {
        debug('Error occurred during database cleanup:', error);
    }
}
debug('Starting database cleanup task');
// Run the cleanup task daily at 2:00 AM
const scheduledTask = new ScheduledTask('Database Cleanup', runCleanup, {
    schedule: {
        hour: 2,
        minute: 0,
        second: 0
    },
    // Run at least once per day
    minimumIntervalMillis: daysToMillis(1),
    startTask: true
});
debug('Database cleanup task initialized and scheduled for daily execution at 2:00 AM');
