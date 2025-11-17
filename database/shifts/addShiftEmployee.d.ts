interface AddShiftEmployeeForm {
    shiftId: number | string;
    employeeNumber: string;
    crewId?: number | string | null;
    shiftEmployeeNote?: string;
}
export default function addShiftEmployee(form: AddShiftEmployeeForm): Promise<boolean>;
export {};
