export interface UpdateUserForm {
    userName: string;
    isActive: boolean;
    shifts_canManage: boolean;
    shifts_canUpdate: boolean;
    shifts_canView: boolean;
    workOrders_canManage: boolean;
    workOrders_canUpdate: boolean;
    workOrders_canView: boolean;
    timesheets_canManage: boolean;
    timesheets_canUpdate: boolean;
    timesheets_canView: boolean;
    isAdmin: boolean;
}
export default function updateUser(updateForm: UpdateUserForm, user: User): Promise<boolean>;
