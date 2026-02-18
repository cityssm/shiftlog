declare global {
    export interface User {
        userName: string;
        employeeNumber: string;
        firstName: string;
        lastName: string;
        userProperties: UserProperties;
        userSettings: Partial<Record<UserSettingKey, string>>;
    }
}
export declare const userSettingKeys: readonly ["apiKey", "timesheets.canMarkEmployeesAsEntered", "timesheets.canMarkEquipmentAsEntered", "workOrders.defaultAssignedToId"];
export type UserSettingKey = (typeof userSettingKeys)[number];
export interface UserProperties {
    isAdmin: boolean;
    /**
     * Whether the user has permissions to view, create, or edit shifts.
     * These settings take into account if shifts are enabled in the system.
     */
    shifts: {
        canView: boolean;
        canUpdate: boolean;
        canManage: boolean;
    };
    /**
     * Whether the user has permissions to view, create, or edit work orders.
     * These settings take into account if work orders are enabled in the system.
     */
    workOrders: {
        canView: boolean;
        canUpdate: boolean;
        canManage: boolean;
    };
    /**
     * Whether the user has permissions to view or edit timesheets.
     * These settings take into account if timesheets are enabled in the system.
     */
    timesheets: {
        canView: boolean;
        canUpdate: boolean;
        canManage: boolean;
    };
}
declare module 'express-session' {
    interface Session {
        user?: User;
    }
}
