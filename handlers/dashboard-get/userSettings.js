import getEmployee from '../../database/employees/getEmployee.js';
import getAssignedToDataListItems from '../../database/workOrders/getAssignedToDataListItems.js';
export default async function handler(request, response) {
    const assignedToDataListItems = await getAssignedToDataListItems(request.session.user);
    // Get employee information if available
    const employee = request.session.user?.employeeNumber
        ? await getEmployee(request.session.user.employeeNumber)
        : undefined;
    response.render('dashboard/userSettings', {
        headTitle: 'User Settings',
        assignedToDataListItems,
        employee
    });
}
