/* eslint-disable @typescript-eslint/naming-convention */
import updateUser from '../../database/users/updateUser.js';
export default async function handler(request, response) {
    const { userName, isActive = '0', shifts_canView = '0', shifts_canUpdate = '0', shifts_canManage = '0', workOrders_canView = '0', workOrders_canUpdate = '0', workOrders_canManage = '0', timesheets_canView = '0', timesheets_canUpdate = '0', timesheets_canManage = '0', isAdmin = '0' } = request.body;
    try {
        const success = await updateUser({
            userName,
            isActive: isActive === '1',
            shifts_canView: shifts_canView === '1',
            shifts_canUpdate: shifts_canUpdate === '1',
            shifts_canManage: shifts_canManage === '1',
            workOrders_canView: workOrders_canView === '1',
            workOrders_canUpdate: workOrders_canUpdate === '1',
            workOrders_canManage: workOrders_canManage === '1',
            timesheets_canView: timesheets_canView === '1',
            timesheets_canUpdate: timesheets_canUpdate === '1',
            timesheets_canManage: timesheets_canManage === '1',
            isAdmin: isAdmin === '1'
        }, request.session.user);
        if (success) {
            response.json({
                message: 'User updated successfully',
                success: true
            });
        }
        else {
            response.status(404).json({
                message: 'User not found',
                success: false
            });
        }
    }
    catch (error) {
        response.status(500).json({
            message: error instanceof Error ? error.message : 'Failed to update user',
            success: false
        });
    }
}
