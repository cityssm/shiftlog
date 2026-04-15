import getEmployeeList from '../database/employeeLists/getEmployeeList.js';
import getEquipment from '../database/equipment/getEquipment.js';
export async function validateEmployeeForEquipment(equipmentNumber, employeeNumber) {
    if (employeeNumber === undefined || employeeNumber === null || employeeNumber === '') {
        return { success: true };
    }
    const equipment = await getEquipment(equipmentNumber, false);
    if (equipment === undefined) {
        return {
            success: false,
            errorMessage: 'Equipment not found.'
        };
    }
    if (equipment.employeeListId === null || equipment.employeeListId === undefined) {
        return { success: true };
    }
    const employeeList = await getEmployeeList(equipment.employeeListId);
    if (employeeList === undefined) {
        return {
            success: false,
            errorMessage: 'Employee list not found for this equipment.'
        };
    }
    const isEmployeeInList = employeeList.members.some((member) => member.employeeNumber === employeeNumber);
    if (!isEmployeeInList) {
        return {
            success: false,
            errorMessage: `Employee ${employeeNumber} is not authorized for equipment ${equipmentNumber}. Only employees on the "${employeeList.employeeListName}" list can be assigned to this equipment.`
        };
    }
    return { success: true };
}
export async function getEligibleEmployeesForEquipment(equipmentNumber, allEmployees) {
    const equipment = await getEquipment(equipmentNumber, false);
    if (equipment === undefined) {
        return [];
    }
    if (equipment.employeeListId === null || equipment.employeeListId === undefined) {
        return allEmployees;
    }
    const employeeList = await getEmployeeList(equipment.employeeListId);
    if (employeeList === undefined) {
        return [];
    }
    const eligibleEmployeeNumbers = new Set(employeeList.members.map((member) => member.employeeNumber));
    return allEmployees.filter((employee) => eligibleEmployeeNumbers.has(employee.employeeNumber));
}
