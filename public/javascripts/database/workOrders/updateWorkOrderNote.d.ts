export interface UpdateWorkOrderNoteForm {
    workOrderId: number | string;
    noteSequence: number | string;
    noteText: string;
}
export default function updateWorkOrderNote(updateWorkOrderNoteForm: UpdateWorkOrderNoteForm, userName: string): Promise<boolean>;
