interface CopyFromPreviousShiftForm {
    currentShiftId: number | string;
    previousShiftId: number | string;
    copyCrews?: boolean;
    copyEmployees?: boolean;
    copyEquipment?: boolean;
}
export default function copyFromPreviousShift(form: CopyFromPreviousShiftForm, user: User): Promise<boolean>;
export {};
