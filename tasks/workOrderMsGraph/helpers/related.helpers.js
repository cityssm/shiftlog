import getWorkOrderAttachments from '../../../database/workOrders/getWorkOrderAttachments.js';
import getWorkOrderNotes from '../../../database/workOrders/getWorkOrderNotes.js';
export async function getWorkOrderNotesAndAttachments(workOrderId) {
    const notes = await getWorkOrderNotes(workOrderId);
    const attachments = await getWorkOrderAttachments(workOrderId);
    return [...notes, ...attachments].sort((a, b) => {
        const dateA = 'recordCreate_dateTime' in a
            ? a.recordCreate_dateTime
            : new Date(0);
        const dateB = 'recordCreate_dateTime' in b
            ? b.recordCreate_dateTime
            : new Date(0);
        return dateB.getTime() - dateA.getTime();
    });
}
