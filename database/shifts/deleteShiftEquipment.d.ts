interface DeleteShiftEquipmentForm {
    shiftId: number | string;
    equipmentNumber: string;
}
export default function deleteShiftEquipment(form: DeleteShiftEquipmentForm): Promise<boolean>;
export {};
