import type { ReportDefinition } from './types.js';
export declare const rawExportReports: {
    'admin-workOrders-raw': {
        parameterNames: never[];
        sql: string;
    };
    'admin-workOrderCosts-raw': {
        parameterNames: never[];
        sql: string;
    };
    'admin-workOrderMilestones-raw': {
        parameterNames: never[];
        sql: string;
    };
    'admin-workOrderNotes-raw': {
        parameterNames: never[];
        sql: string;
    };
    'admin-workOrderTags-raw': {
        parameterNames: never[];
        sql: string;
    };
    'admin-shifts-raw': {
        parameterNames: never[];
        sql: string;
    };
    'admin-timesheets-raw': {
        parameterNames: never[];
        sql: string;
    };
};
export declare const adminReports: Record<`admin-${string}`, ReportDefinition>;
export default adminReports;
