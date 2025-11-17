interface UpdateShiftEmployeeForm {
    shiftId: number | string;
    employeeNumber: string;
    crewId?: number | string | null;
}
export default function updateShiftEmployee(form: UpdateShiftEmployeeForm): Promise<boolean>;
export {};
