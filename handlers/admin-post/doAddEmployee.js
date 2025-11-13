import addEmployee from '../../database/employees/addEmployee.js';
import getEmployees from '../../database/employees/getEmployees.js';
export default async function handler(request, response) {
    const success = await addEmployee(request.body.employeeNumber, request.body.firstName, request.body.lastName, request.session.user);
    const employees = await getEmployees();
    response.json({
        employees,
        success
    });
}
