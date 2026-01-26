export interface UpdateShiftEquipmentNoteForm {
    shiftId: number | string;
    equipmentNumber: string;
    shiftEquipmentNote: string;
}
export default function updateShiftEquipmentNote(form: UpdateShiftEquipmentNoteForm): Promise<boolean>;
