import { type ChildProcess, fork } from 'node:child_process'

import { getConfigProperty } from '../helpers/config.helpers.js'
import type { WorkerMessage } from '../types/application.types.js'

type OptionalTaskName =
  | 'employeeSync'
  | 'equipmentSync'
  | 'locationSync'
  | 'notifications'
  | 'workOrderMsGraph'

type RequiredTaskName = 'databaseCleanup'

export type InitializeTasksReturn = Partial<
  Record<OptionalTaskName, ChildProcess>
> &
  Record<RequiredTaskName, ChildProcess>

export function initializeTasks(): InitializeTasksReturn {
  const childProcesses: Partial<InitializeTasksReturn> = {}

  /*
   * Employee Sync Task
   */

  if (getConfigProperty('employees.syncSource') !== '') {
    const childProcess = fork('./tasks/employeeSync/task.js', {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'inherit'
    })

    childProcesses.employeeSync = childProcess
  }

  /*
   * Equipment Sync Task
   */

  if (getConfigProperty('equipment.syncSource') !== '') {
    const childProcess = fork('./tasks/equipmentSync/task.js', {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'inherit'
    })

    childProcesses.equipmentSync = childProcess
  }

  /*
   * Location Sync Task
   */

  if (getConfigProperty('locations.syncSource') !== '') {
    const childProcess = fork('./tasks/locationSync/task.js', {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'inherit'
    })

    childProcesses.locationSync = childProcess
  }

  /*
   * Notification Task
   */

  if (getConfigProperty('notifications.protocols').length > 0) {
    const notificationTask = fork('./tasks/notifications/task.js', {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'inherit'
    })

    childProcesses.notifications = notificationTask
  }

  /*
   * Work Order MS Graph Task
   */

  if (getConfigProperty('connectors.msGraph') !== undefined) {
    const msGraphTask = fork('./tasks/workOrderMsGraph/task.js', {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'inherit'
    })

    childProcesses.workOrderMsGraph = msGraphTask

    msGraphTask.on('message', (message: WorkerMessage) => {
      if (message.targetProcesses === 'task.notifications') {
        childProcesses.notifications?.send(message)
        msGraphTask.send(message)
      }
    })
  }

  /*
   * Database Cleanup Task
   */

  const cleanupTask = fork('./tasks/databaseCleanup/task.js', {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit'
  })

  childProcesses.databaseCleanup = cleanupTask

  return childProcesses as InitializeTasksReturn
}
