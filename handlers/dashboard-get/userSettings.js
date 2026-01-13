import getAssignedToList from '../../database/assignedTo/getAssignedToList.js';
import getEmployee from '../../database/employees/getEmployee.js';
export default async function handler(request, response) {
    const assignedToDataListItems = await getAssignedToList(request.session.user?.userName);
    // Get employee information if available and userName matches
    let employee = request.session.user?.employeeNumber
        ? await getEmployee(request.session.user.employeeNumber)
        : undefined;
    // Verify that the employee's userName matches the current user's userName
    if (employee !== undefined &&
        employee.userName !== request.session.user?.userName) {
        employee = undefined;
    }
    response.render('dashboard/userSettings', {
        headTitle: 'User Settings',
        assignedToDataListItems,
        employee
    });
}
