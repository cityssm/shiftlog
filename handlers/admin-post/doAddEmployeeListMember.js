import addEmployeeListMember from '../../database/employeeLists/addEmployeeListMember.js';
import getEmployeeList from '../../database/employeeLists/getEmployeeList.js';
export default async function handler(request, response) {
    const employeeListId = Number.parseInt(request.body.employeeListId, 10);
    const success = await addEmployeeListMember(employeeListId, request.body.employeeNumber, request.body.seniorityDate === '' ? undefined : request.body.seniorityDate, Number.parseInt(request.body.seniorityOrderNumber, 10));
    const employeeList = await getEmployeeList(employeeListId);
    response.json({
        employeeList,
        success
    });
}
