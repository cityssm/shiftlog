export interface UpdateUserForm {
    userName: string;
    isActive: boolean;
    shifts_canView: boolean;
    shifts_canUpdate: boolean;
    shifts_canManage: boolean;
    workOrders_canView: boolean;
    workOrders_canUpdate: boolean;
    workOrders_canManage: boolean;
    timesheets_canView: boolean;
    timesheets_canUpdate: boolean;
    timesheets_canManage: boolean;
    isAdmin: boolean;
}
export default function updateUser(updateForm: UpdateUserForm, user: User): Promise<boolean>;
