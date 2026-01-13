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
    shifts: {
        canView: boolean;
        canUpdate: boolean;
        canManage: boolean;
    };
    workOrders: {
        canView: boolean;
        canUpdate: boolean;
        canManage: boolean;
    };
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
