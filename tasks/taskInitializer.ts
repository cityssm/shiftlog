import { type ChildProcess, fork } from 'node:child_process'

import { getConfigProperty } from '../helpers/config.helpers.js'

type OptionalTaskName = 'employeeSync' | 'equipmentSync' | 'locationSync'

type RequiredTaskName = 'databaseCleanup' | 'notifications'

export type InitializeTasksReturn = Partial<Record<OptionalTaskName, ChildProcess>> &
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

  const notificationTask = fork('./tasks/notifications/task.js', {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit'
  })

  childProcesses.notifications = notificationTask

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
