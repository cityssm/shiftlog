export interface CreateWorkOrderNoteForm {
    fields?: Record<string, string>;
    noteText: string;
    noteTypeId?: number | string;
    workOrderId: number | string;
}
export default function createWorkOrderNote(createWorkOrderNoteForm: CreateWorkOrderNoteForm, userName: string): Promise<number | undefined>;
