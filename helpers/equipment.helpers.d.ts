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
