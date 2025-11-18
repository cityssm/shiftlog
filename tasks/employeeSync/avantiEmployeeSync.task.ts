import { ScheduledTask } from '@cityssm/scheduled-task'
import { minutesToMillis } from '@cityssm/to-millis'
import { Range } from 'node-schedule'

import getMaximumEmployeeRecordSyncDateTime from '../../database/employees/getMaximumEmployeeRecordSyncDateTime.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import { AvantiApi } from '@cityssm/avanti-api'

async function syncEmployees(): Promise<void> {

  const employeeConfig = getConfigProperty('employees')

  if (employeeConfig.syncSource !== 'avanti') {
    return
  }

  const avantiConfig = getConfigProperty('connectors.avanti')

  if (avantiConfig === undefined) {
    return
  }

  const avantiApi = new AvantiApi(avantiConfig)

  const getEmployeesRequest = employeeConfig.filters ?? {}

  const employees = await avantiApi.getEmployees(getEmployeesRequest)
}

const lastRunDateTime = await getMaximumEmployeeRecordSyncDateTime()

const scheduledTask = new ScheduledTask(
  'Employee Sync - Avanti',
  syncEmployees,
  {
    schedule: {
      dayOfWeek: new Range(1, 5),
      hour: new Range(8, 16),
      minute: 0,
      second: 0
    },

    lastRunMillis: lastRunDateTime?.getTime(),
    minimumIntervalMillis: minutesToMillis(45),

    startTask: true
  }
)

if (Date.now() - (lastRunDateTime?.getTime() ?? 0) > minutesToMillis(45)) {
  await scheduledTask.runTask()
}
