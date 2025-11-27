/**
 * System list keys that are required for the application to function properly.
 */
export declare const REQUIRED_SYSTEM_LISTS: {
    readonly equipmentTypes: "Equipment Types";
    readonly assignedTo: "Assigned To";
    readonly workOrderStatuses: "Work Order Statuses";
    readonly shiftTimes: "Shift Times";
    readonly shiftTypes: "Shift Types";
    readonly jobClassifications: "Job Classifications";
    readonly timeCodes: "Time Codes";
    readonly timesheetTypes: "Timesheet Types";
};
/**
 * Validates that all required system lists exist in the DataLists table.
 * This check should be run on application startup to ensure database integrity.
 * @throws {Error} if any required system lists are missing
 */
export declare function validateSystemLists(): Promise<void>;
