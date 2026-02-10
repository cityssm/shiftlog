import getEmployeeList from '../../database/employeeLists/getEmployeeList.js';
import reorderEmployeeListMembers from '../../database/employeeLists/reorderEmployeeListMembers.js';
export default async function handler(request, response) {
    const success = await reorderEmployeeListMembers(request.body);
    let employeeList;
    if (success) {
        employeeList = await getEmployeeList(request.body.employeeListId);
    }
    response.json({
        employeeList,
        success
    });
}
