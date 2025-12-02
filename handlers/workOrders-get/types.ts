import type { DataListItem, WorkOrder, WorkOrderType } from '../../types/record.types.js'

export interface WorkOrderEditResponse {
  headTitle: string

  isCreate: boolean
  isEdit: boolean

  workOrder: Partial<WorkOrder>
  canReopen?: boolean

  workOrderTypes: WorkOrderType[]
  workOrderStatuses: DataListItem[]
  assignedToOptions: DataListItem[]
}
