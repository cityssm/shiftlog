import addEmployeeList from '../../database/employeeLists/addEmployeeList.js';
import getEmployeeLists from '../../database/employeeLists/getEmployeeLists.js';
export default async function handler(request, response) {
    const employeeListId = await addEmployeeList({
        employeeListName: request.body.employeeListName,
        userGroupId: request.body.userGroupId === ''
            ? undefined
            : Number.parseInt(request.body.userGroupId, 10)
    }, request.session.user);
    const employeeLists = await getEmployeeLists();
    response.json({
        employeeListId,
        employeeLists,
        success: employeeListId !== undefined
    });
}
