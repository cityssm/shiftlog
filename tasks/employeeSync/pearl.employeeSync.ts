import { WorkTechAPI } from '@cityssm/worktech-api'
import { parseFullName } from 'parse-full-name'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import type { Employee } from '../../types/record.types.js'

export default async function getEmployees(): Promise<
  Array<Partial<Employee>> | undefined
> {
  const employeeConfig = getConfigProperty('employees')

  if (employeeConfig.syncSource !== 'pearl') {
    return undefined
  }

  const pearlConfig = getConfigProperty('connectors.pearl')

  if (pearlConfig === undefined) {
    return undefined
  }

  const worktechApi = new WorkTechAPI(pearlConfig)

  const worktechEmployees = await worktechApi.getEmployees(
    employeeConfig.filters ?? {}
  )

  const employees: Array<Partial<Employee>> = []

  for (const worktechEmployee of worktechEmployees) {
    const parsedName = parseFullName(worktechEmployee.employeeName)

    const employee: Partial<Employee> = {
      employeeNumber: worktechEmployee.employeeNumber,
      firstName: parsedName.first ?? '',
      lastName: parsedName.last ?? '',

      emailAddress: worktechEmployee.emailAddress,
      phoneNumber: worktechEmployee.phoneNumber1,

      recordSync_dateTime: new Date(),
      recordSync_isSynced: true,
      recordSync_source: 'pearl'
    }

    employees.push(employee)
  }

  return employees
}
