import path from 'node:path'

import type { ServiceConfig } from 'node-windows'

const _dirname = '.'

export const serviceConfig: ServiceConfig = {
  name: 'ShiftLog',

  description: 'A work management system with work order recording, shift activity logging, and timesheet tracking.',

  script: path.join(_dirname, 'index.js')
}
