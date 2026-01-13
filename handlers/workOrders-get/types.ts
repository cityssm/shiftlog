import type { AssignedTo, DataListItem, WorkOrder, WorkOrderAttachment, WorkOrderType } from '../../types/record.types.js'

export interface WorkOrderEditResponse {
  headTitle: string

  isCreate: boolean
  isEdit: boolean

  workOrder: Partial<WorkOrder>
  canReopen?: boolean
  thumbnailAttachment?: WorkOrderAttachment

  assignedToOptions: AssignedTo[]
  workOrderTypes: WorkOrderType[]
  workOrderStatuses: DataListItem[]
  workOrderPriorities: DataListItem[]
}
