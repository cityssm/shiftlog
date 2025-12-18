import type { Employee } from '../types/record.types.js';
/**
 * Validates if an employee is allowed to be assigned to a piece of equipment.
 * If the equipment has an employee list, the employee must be on that list.
 * If the equipment has no employee list, any employee is allowed.
 *
 * @param equipmentNumber - The equipment number to validate against
 * @param employeeNumber - The employee number to validate (can be undefined/null for unassigned equipment)
 * @returns Object with success flag and optional error message
 */
export declare function validateEmployeeForEquipment(equipmentNumber: string, employeeNumber?: string | null): Promise<{
    success: boolean;
    errorMessage?: string;
}>;
/**
 * Gets the list of employees eligible to be assigned to a piece of equipment.
 * If the equipment has an employee list, returns only those employees.
 * If the equipment has no employee list, returns all provided employees.
 *
 * @param equipmentNumber - The equipment number to check
 * @param allEmployees - The complete list of employees to filter
 * @returns Array of eligible employees
 */
export declare function getEligibleEmployeesForEquipment(equipmentNumber: string, allEmployees: Employee[]): Promise<Employee[]>;
