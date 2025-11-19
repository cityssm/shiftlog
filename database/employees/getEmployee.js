import getEmployees from './getEmployees.js';
export default async function getEmployee(employeeNumber, includeDeleted = false) {
    const employees = await getEmployees({ employeeNumber, includeDeleted });
    return employees.length > 0 ? employees[0] : undefined;
}
