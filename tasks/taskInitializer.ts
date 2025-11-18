import { ChildProcess } from 'node:child_process'
import { getConfigProperty } from '../helpers/config.helpers.js'

export async function initializeEmployeeSyncTask(): Promise<
  ChildProcess | undefined
> {
  const employeeConfig = getConfigProperty('employees')

  if (employeeConfig.syncSource === 'avanti') {
    const { initializeAvantiEmployeeSyncTask } = await import(
      '../tasks/avantiEmployeeSync.task.js'
    )

    return initializeAvantiEmployeeSyncTask()
  }
}
