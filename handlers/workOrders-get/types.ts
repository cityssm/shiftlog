import type {
  AssignedTo,
  DataListItem,
  WorkOrder,
  WorkOrderAttachment,
  WorkOrderSubscriber,
  WorkOrderTag,
  WorkOrderType
} from '../../types/record.types.js'

export interface WorkOrderEditResponse {
  headTitle: string
  section: 'workOrders'

  isCreate: boolean
  isEdit: boolean

  workOrder: Partial<WorkOrder>
  canReopen?: boolean
  thumbnailAttachment?: WorkOrderAttachment

  assignedToOptions: AssignedTo[]
  workOrderPriorities: DataListItem[]
  workOrderStatuses: DataListItem[]
  workOrderTypes: WorkOrderType[]

  workOrderSubscribers: WorkOrderSubscriber[]
  workOrderTags: WorkOrderTag[]
}
