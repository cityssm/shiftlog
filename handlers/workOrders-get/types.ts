import type { DataListItem, WorkOrder } from '../../types/record.types.js'

export interface WorkOrderEditResponse {
  headTitle: string

  isCreate: boolean
  isEdit: boolean

  workOrder: Partial<WorkOrder>

  workOrderTypes: DataListItem[]
  workOrderStatuses: DataListItem[]
  assignedToOptions: DataListItem[]
}
