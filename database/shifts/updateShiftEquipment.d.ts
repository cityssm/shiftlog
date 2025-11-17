interface UpdateShiftEquipmentForm {
    shiftId: number | string;
    equipmentNumber: string;
    employeeNumber?: string | null;
}
export default function updateShiftEquipment(form: UpdateShiftEquipmentForm): Promise<boolean>;
export {};
