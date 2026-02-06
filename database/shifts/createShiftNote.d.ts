export interface CreateShiftNoteForm {
    fields?: Record<string, string>;
    noteText: string;
    noteTypeId?: number | string;
    shiftId: number | string;
}
export default function createShiftNote(createShiftNoteForm: CreateShiftNoteForm, userName: string): Promise<number | undefined>;
