export interface CreateWorkOrderNoteForm {
    workOrderId: number | string;
    noteText: string;
}
export default function createWorkOrderNote(createWorkOrderNoteForm: CreateWorkOrderNoteForm, userName: string): Promise<number>;
