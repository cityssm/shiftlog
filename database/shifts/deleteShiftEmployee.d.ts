interface DeleteShiftEmployeeForm {
    shiftId: number | string;
    employeeNumber: string;
}
export default function deleteShiftEmployee(form: DeleteShiftEmployeeForm): Promise<boolean>;
export {};
