interface UpdateShiftCrewNoteForm {
    shiftId: number | string;
    crewId: number | string;
    shiftCrewNote: string;
}
export default function updateShiftCrewNote(form: UpdateShiftCrewNoteForm): Promise<boolean>;
export {};
