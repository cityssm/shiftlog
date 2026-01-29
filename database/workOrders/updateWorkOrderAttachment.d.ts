export interface UpdateWorkOrderAttachmentForm {
    workOrderAttachmentId: number | string;
    attachmentDescription: string;
}
export default function updateWorkOrderAttachment(updateWorkOrderAttachmentForm: UpdateWorkOrderAttachmentForm, userName: string): Promise<boolean>;
