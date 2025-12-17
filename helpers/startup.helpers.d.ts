/**
 * System list keys that are required for the application to function properly.
 */
export declare const REQUIRED_SYSTEM_LISTS: {
    readonly equipmentTypes: "Equipment Types";
    readonly assignedTo: "Work Orders - Assigned To";
    readonly workOrderPriorities: "Work Orders - Priorities";
    readonly workOrderStatuses: "Work Orders - Statuses";
    readonly shiftTimes: "Shifts - Times";
    readonly shiftTypes: "Shifts - Types";
    readonly jobClassifications: "Timesheets - Job Classifications";
    readonly timeCodes: "Timesheets - Time Codes";
    readonly timesheetTypes: "Timesheets - Types";
};
/**
 * Validates that all required system lists exist in the DataLists table.
 * This check should be run on application startup to ensure database integrity.
 * @throws {Error} if any required system lists are missing
 */
export declare function validateSystemLists(): Promise<void>;
