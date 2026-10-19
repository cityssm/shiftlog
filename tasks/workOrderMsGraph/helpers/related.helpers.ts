import getWorkOrderAttachments from '../../../database/workOrders/getWorkOrderAttachments.js'
import getWorkOrderNotes, {
  WorkOrderNote
} from '../../../database/workOrders/getWorkOrderNotes.js'
import { WorkOrderAttachment } from '../../../types/record.types.js'

export async function getWorkOrderNotesAndAttachments(
  workOrderId: number | string
): Promise<Array<WorkOrderAttachment | WorkOrderNote>> {
  const notes: Array<WorkOrderNote> = await getWorkOrderNotes(workOrderId)
  const attachments: Array<WorkOrderAttachment> =
    await getWorkOrderAttachments(workOrderId)

  // Create a combined array of notes and attachments sorted by their creation date
  return [...notes, ...attachments].sort((a, b) => {
    const dateA =
      'recordCreate_dateTime' in a
        ? (a.recordCreate_dateTime as Date)
        : new Date(0)

    const dateB =
      'recordCreate_dateTime' in b
        ? (b.recordCreate_dateTime as Date)
        : new Date(0)

    return dateB.getTime() - dateA.getTime()
  })
}
