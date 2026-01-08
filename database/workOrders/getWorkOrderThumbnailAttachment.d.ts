import type { WorkOrderAttachment } from '../../types/record.types.js';
/**
 * Gets the thumbnail attachment for a work order.
 * @param workOrderId - The ID of the work order
 * @returns The thumbnail attachment if one exists, otherwise undefined
 */
export default function getWorkOrderThumbnailAttachment(workOrderId: number | string): Promise<WorkOrderAttachment | undefined>;
