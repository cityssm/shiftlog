import type { Timesheet } from '../../types/record.types.js'

export interface TimesheetEditResponse {
  headTitle: string
  isCreate: boolean
  isEdit: boolean
  timesheet: Timesheet | Partial<Timesheet>
  timesheetTypes: any[]
  supervisors: any[]
}
