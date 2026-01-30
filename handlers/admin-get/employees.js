import getEmployees from '../../database/employees/getEmployees.js';
import getUserGroups from '../../database/users/getUserGroups.js';
export default async function handler(_request, response) {
    const employees = await getEmployees();
    const userGroups = await getUserGroups();
    response.render('admin/employees', {
        headTitle: 'Employee Management',
        section: 'admin',
        employees,
        userGroups
    });
}
