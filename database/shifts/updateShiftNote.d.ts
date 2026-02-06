export interface UpdateShiftNoteForm {
    fields?: Record<string, string>;
    noteSequence: number | string;
    noteText: string;
    shiftId: number | string;
}
export default function updateShiftNote(updateShiftNoteForm: UpdateShiftNoteForm, userName: string): Promise<boolean>;
