import getUsers from '../../database/users/getUsers.js';
import updateUser from '../../database/users/updateUser.js';
export default async function handler(request, response) {
    const { userName, permissionField } = request.body;
    if (!userName || !permissionField) {
        response.status(400).json({
            success: false,
            message: 'User name and permission field are required'
        });
        return;
    }
    const validPermissions = [
        'isActive',
        'shifts_canView',
        'shifts_canUpdate',
        'shifts_canManage',
        'workOrders_canView',
        'workOrders_canUpdate',
        'workOrders_canManage',
        'timesheets_canView',
        'timesheets_canUpdate',
        'timesheets_canManage',
        'isAdmin'
    ];
    if (!validPermissions.includes(permissionField)) {
        response.status(400).json({
            success: false,
            message: 'Invalid permission field'
        });
        return;
    }
    try {
        // Get current user data
        const users = await getUsers();
        const currentUser = users.find((u) => u.userName === userName);
        if (!currentUser) {
            response.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        // Toggle the permission
        const updateForm = {
            userName,
            isActive: permissionField === 'isActive'
                ? !currentUser.isActive
                : currentUser.isActive,
            shifts_canView: permissionField === 'shifts_canView'
                ? !currentUser.shifts_canView
                : currentUser.shifts_canView,
            shifts_canUpdate: permissionField === 'shifts_canUpdate'
                ? !currentUser.shifts_canUpdate
                : currentUser.shifts_canUpdate,
            shifts_canManage: permissionField === 'shifts_canManage'
                ? !currentUser.shifts_canManage
                : currentUser.shifts_canManage,
            workOrders_canView: permissionField === 'workOrders_canView'
                ? !currentUser.workOrders_canView
                : currentUser.workOrders_canView,
            workOrders_canUpdate: permissionField === 'workOrders_canUpdate'
                ? !currentUser.workOrders_canUpdate
                : currentUser.workOrders_canUpdate,
            workOrders_canManage: permissionField === 'workOrders_canManage'
                ? !currentUser.workOrders_canManage
                : currentUser.workOrders_canManage,
            timesheets_canView: permissionField === 'timesheets_canView'
                ? !currentUser.timesheets_canView
                : currentUser.timesheets_canView,
            timesheets_canUpdate: permissionField === 'timesheets_canUpdate'
                ? !currentUser.timesheets_canUpdate
                : currentUser.timesheets_canUpdate,
            timesheets_canManage: permissionField === 'timesheets_canManage'
                ? !currentUser.timesheets_canManage
                : currentUser.timesheets_canManage,
            isAdmin: permissionField === 'isAdmin'
                ? !currentUser.isAdmin
                : currentUser.isAdmin
        };
        const success = await updateUser(updateForm, request.session.user);
        if (success) {
            const updatedUsers = await getUsers();
            response.json({
                success: true,
                message: 'Permission updated successfully',
                users: updatedUsers
            });
        }
        else {
            response.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
    }
    catch (error) {
        response.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to update permission'
        });
    }
}
