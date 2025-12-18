import getEquipment from '../database/equipment/getEquipment.js'
import getEmployeeList from '../database/employeeLists/getEmployeeList.js'
import type { Employee } from '../types/record.types.js'

/**
 * Validates if an employee is allowed to be assigned to a piece of equipment.
 * If the equipment has an employee list, the employee must be on that list.
 * If the equipment has no employee list, any employee is allowed.
 *
 * @param equipmentNumber - The equipment number to validate against
 * @param employeeNumber - The employee number to validate (can be undefined/null for unassigned equipment)
 * @returns Object with success flag and optional error message
 */
export async function validateEmployeeForEquipment(
  equipmentNumber: string,
  employeeNumber?: string | null
): Promise<{ success: boolean; errorMessage?: string }> {
  // If no employee is assigned, validation passes
  if (employeeNumber === undefined || employeeNumber === null || employeeNumber === '') {
    return { success: true }
  }

  // Get the equipment details
  const equipment = await getEquipment(equipmentNumber, false)

  if (equipment === undefined) {
    return {
      success: false,
      errorMessage: 'Equipment not found.'
    }
  }

  // If equipment has no employee list restriction, allow any employee
  if (equipment.employeeListId === null || equipment.employeeListId === undefined) {
    return { success: true }
  }

  // Equipment has an employee list - check if employee is on the list
  const employeeList = await getEmployeeList(equipment.employeeListId)

  if (employeeList === undefined) {
    return {
      success: false,
      errorMessage: 'Employee list not found for this equipment.'
    }
  }

  // Check if employee is in the list
  const isEmployeeInList = employeeList.members.some(
    (member) => member.employeeNumber === employeeNumber
  )

  if (!isEmployeeInList) {
    return {
      success: false,
      errorMessage: `Employee ${employeeNumber} is not authorized for equipment ${equipmentNumber}. Only employees on the "${employeeList.employeeListName}" list can be assigned to this equipment.`
    }
  }

  return { success: true }
}

/**
 * Gets the list of employees eligible to be assigned to a piece of equipment.
 * If the equipment has an employee list, returns only those employees.
 * If the equipment has no employee list, returns all provided employees.
 *
 * @param equipmentNumber - The equipment number to check
 * @param allEmployees - The complete list of employees to filter
 * @returns Array of eligible employees
 */
export async function getEligibleEmployeesForEquipment(
  equipmentNumber: string,
  allEmployees: Employee[]
): Promise<Employee[]> {
  // Get the equipment details
  const equipment = await getEquipment(equipmentNumber, false)

  if (equipment === undefined) {
    return []
  }

  // If equipment has no employee list restriction, return all employees
  if (equipment.employeeListId === null || equipment.employeeListId === undefined) {
    return allEmployees
  }

  // Equipment has an employee list - get the list
  const employeeList = await getEmployeeList(equipment.employeeListId)

  if (employeeList === undefined) {
    return []
  }

  // Filter employees to only those on the list
  const eligibleEmployeeNumbers = new Set(
    employeeList.members.map((member) => member.employeeNumber)
  )

  return allEmployees.filter((employee) =>
    eligibleEmployeeNumbers.has(employee.employeeNumber)
  )
}
