export interface CreateWorkOrderNoteForm {
    workOrderId: number | string;
    noteTypeId?: number | string;
    noteText: string;
    fields?: Record<string, string>;
}
export default function createWorkOrderNote(createWorkOrderNoteForm: CreateWorkOrderNoteForm, userName: string): Promise<number | undefined>;
