interface AddShiftEquipmentForm {
    shiftId: number | string;
    equipmentNumber: string;
    employeeNumber?: string | null;
    shiftEquipmentNote?: string;
}
export default function addShiftEquipment(form: AddShiftEquipmentForm): Promise<boolean>;
export {};
