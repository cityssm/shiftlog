import type { ChildProcess } from 'node:child_process'
import cluster, { type Worker } from 'node:cluster'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { secondsToMillis } from '@cityssm/to-millis'
import Debug from 'debug'
import exitHook, { gracefulExit } from 'exit-hook'

import { DEBUG_NAMESPACE } from './debug.config.js'
import { getConfigProperty } from './helpers/config.helpers.js'
import { validateSystemLists } from './helpers/startup.helpers.js'
import { initializeTasks } from './tasks/taskInitializer.js'
import type { WorkerMessage } from './types/application.types.js'
import version from './version.js'

const debug = Debug(`${DEBUG_NAMESPACE}:index`)

let doShutdown = false

const activeWorkers = new Map<number, Worker>()
let tasksChildProcesses: ChildProcess[] = []

function initializeCluster(): void {
  const directoryName = path.dirname(fileURLToPath(import.meta.url))

  const processCount = Math.min(
    getConfigProperty('application.maximumProcesses'),
    os.cpus().length * 2
  )

  const applicationName = getConfigProperty('application.applicationName')

  process.title = `${applicationName} (Primary)`

  debug(`Primary pid:   ${process.pid}`)
  debug(`Primary title: ${process.title}`)
  debug(`Version:       ${version}`)
  debug(`Launching ${processCount} processes`)

  /*
   * Set up the cluster
   */

  const clusterSettings = {
    exec: `${directoryName}/app/appProcess.js`
  }

  cluster.setupPrimary(clusterSettings)

  for (let index = 0; index < processCount; index += 1) {
    const worker = cluster.fork()
    activeWorkers.set(worker.process.pid ?? 0, worker)
  }

  cluster.on('message', (_worker, message: WorkerMessage) => {
    if (message.targetProcesses === 'tasks') {
      for (const taskProcess of tasksChildProcesses) {
        if (
          taskProcess.pid === undefined ||
          taskProcess.pid === message.sourcePid
        ) {
          continue
        }

        debug(`Relaying message to task process: ${taskProcess.pid}`)
        taskProcess.send(message)
      }
    } else {
      for (const [pid, activeWorker] of activeWorkers.entries()) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (activeWorker === undefined || pid === message.sourcePid) {
          continue
        }

        debug(`Relaying message to worker: ${pid}`)
        activeWorker.send(message)
      }
    }
  })

  cluster.on('exit', (worker) => {
    debug(`Worker ${(worker.process.pid ?? 0).toString()} has been killed`)
    activeWorkers.delete(worker.process.pid ?? 0)

    if (!doShutdown) {
      // eslint-disable-next-line sonarjs/pseudo-random
      const delaySeconds = 5 + 15 * Math.random()

      debug(`New worker will be started in ${delaySeconds.toFixed(0)} seconds...`)

      globalThis.setTimeout(() => {
        const newWorker = cluster.fork()

        activeWorkers.set(newWorker.process.pid ?? 0, newWorker)
      }, secondsToMillis(delaySeconds))
    }
  })
}

async function startApplication(): Promise<void> {
  /*
   * Validate System Lists
   */

  await validateSystemLists()

  /*
   * Start workers
   */

  initializeCluster()

  /*
   * Start Other Tasks
   */

  tasksChildProcesses = initializeTasks()

  /*
   * Set up the exit hook
   */

  exitHook(() => {
    doShutdown = true

    debug('Shutting down cluster workers...')

    for (const worker of activeWorkers.values()) {
      debug(`Killing worker ${worker.process.pid}`)
      worker.kill()
    }

    debug('Shutting down task child processes...')

    for (const childProcess of tasksChildProcesses) {
      debug(`Killing process ${childProcess.pid}`)
      childProcess.kill()
    }
  })
}

await startApplication()

/*
 * Set up the startup test
 */

if (process.env.STARTUP_TEST === 'true') {
  const killSeconds = 10

  debug(`Killing processes in ${killSeconds} seconds...`)

  setTimeout(() => {
    debug('Killing processes')

    doShutdown = true

    gracefulExit(0)
  }, secondsToMillis(killSeconds))
}
