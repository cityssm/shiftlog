interface UpdateShiftEmployeeNoteForm {
    shiftId: number | string;
    employeeNumber: string;
    shiftEmployeeNote: string;
}
export default function updateShiftEmployeeNote(form: UpdateShiftEmployeeNoteForm): Promise<boolean>;
export {};
