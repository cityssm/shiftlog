export interface EmployeeUpdateFields {
    emailAddress?: string | null;
    employeeNumber: string;
    firstName: string;
    isSupervisor?: boolean;
    recordSync_isSynced?: boolean;
    lastName: string;
    phoneNumber?: string | null;
    phoneNumberAlternate?: string | null;
    userGroupId?: number | null;
    userName?: string | null;
}
export default function updateEmployee(employeeFields: EmployeeUpdateFields, user: User): Promise<boolean>;
