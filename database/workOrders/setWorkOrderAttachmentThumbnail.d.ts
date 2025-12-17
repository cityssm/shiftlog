/**
 * Sets an attachment as the thumbnail for a work order.
 * This will clear any existing thumbnail for the work order and set the new one.
 * @param workOrderAttachmentId - The ID of the attachment to set as thumbnail
 * @param userName - The username of the user making the change
 * @returns True if successful
 */
export default function setWorkOrderAttachmentThumbnail(workOrderAttachmentId: number | string, userName: string): Promise<boolean>;
