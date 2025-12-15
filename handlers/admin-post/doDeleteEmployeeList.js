import deleteEmployeeList from '../../database/employeeLists/deleteEmployeeList.js';
import getEmployeeLists from '../../database/employeeLists/getEmployeeLists.js';
export default async function handler(request, response) {
    const success = await deleteEmployeeList(Number.parseInt(request.body.employeeListId, 10), request.session.user);
    const employeeLists = await getEmployeeLists();
    response.json({
        employeeLists,
        success
    });
}
