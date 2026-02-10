import getEmployeeList from '../../database/employeeLists/getEmployeeList.js';
export default async function handler(request, response) {
    const employeeListId = Number.parseInt(request.body.employeeListId, 10);
    const employeeList = await getEmployeeList(employeeListId);
    response.json({
        employeeList
    });
}
