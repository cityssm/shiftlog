import { ScheduledTask } from '@cityssm/scheduled-task';
import { millisecondsInOneDay } from '@cityssm/to-millis';
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
// Run the cleanup task on Monday at 2:00 AM
// The task is automatically started and managed by the ScheduledTask class
const scheduledTask = new ScheduledTask('Database Cleanup', runCleanup, {
    schedule: {
        dayOfWeek: 1, // Monday
        hour: 2,
        minute: 0,
        second: 0
    },
    // Do not run more than once a day
    minimumIntervalMillis: millisecondsInOneDay
});
scheduledTask.startTask();
debug('Database cleanup task initialized and scheduled for weekly execution on Monday at 2:00 AM');
