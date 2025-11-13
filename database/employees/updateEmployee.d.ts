export interface EmployeeUpdateFields {
    employeeNumber: string;
    firstName: string;
    lastName: string;
    userName?: string | null;
    isSupervisor?: boolean;
    phoneNumber?: string | null;
    phoneNumberAlternate?: string | null;
    emailAddress?: string | null;
    userGroupId?: number | null;
}
export default function updateEmployee(employeeFields: EmployeeUpdateFields, user: User): Promise<boolean>;
