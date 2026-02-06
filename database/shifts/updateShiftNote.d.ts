export interface UpdateShiftNoteForm {
    shiftId: number | string;
    noteSequence: number | string;
    noteText: string;
    fields?: Record<string, string>;
}
export default function updateShiftNote(updateShiftNoteForm: UpdateShiftNoteForm, userName: string): Promise<boolean>;
