import type { Employee } from '../../types/record.types.js'

import getEmployees from './getEmployees.js'

export default async function getEmployee(
  employeeNumber: string,
  includeDeleted = false
): Promise<Employee | undefined> {
  const employees = await getEmployees({ employeeNumber, includeDeleted })
  return employees.length > 0 ? employees[0] : undefined
}
