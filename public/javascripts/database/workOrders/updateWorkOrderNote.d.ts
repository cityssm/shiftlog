export interface UpdateWorkOrderNoteForm {
    workOrderId: number | string;
    noteSequence: number | string;
    noteText: string;
    fields?: Record<string, string>;
}
export default function updateWorkOrderNote(updateWorkOrderNoteForm: UpdateWorkOrderNoteForm, userName: string): Promise<boolean>;
