export interface EmployeeContactFields {
    phoneNumber?: string | null;
    phoneNumberAlternate?: string | null;
    emailAddress?: string | null;
}
export default function updateEmployeeContactByUserName(userName: string, contactFields: EmployeeContactFields, user: User): Promise<boolean>;
//# sourceMappingURL=updateEmployeeContactByUserName.d.ts.map