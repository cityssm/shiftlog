import { type ChildProcess, fork } from 'node:child_process'

import { getConfigProperty } from '../helpers/config.helpers.js'

export function initializeTasks(): ChildProcess[] {
  const childProcesses: ChildProcess[] = []

  /*
   * Employee Sync Task
   */

  if (getConfigProperty('employees.syncSource') !== '') {
    const childProcess = fork('./tasks/employeeSync/task.js', {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'inherit'
    })

    childProcesses.push(childProcess)
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

    childProcesses.push(childProcess)
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

    childProcesses.push(childProcess)
  }

  /*
   * Notification Task
   */

  const notificationTask = fork('./tasks/notifications/task.js', {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit'
  })

  childProcesses.push(notificationTask)

  /*
   * Database Cleanup Task
   */

  const cleanupTask = fork('./tasks/databaseCleanup/task.js', {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit'
  })

  childProcesses.push(cleanupTask)

  return childProcesses
}
