import type { EmployeeList, EmployeeListMember } from '../../types/record.types.js';
export interface EmployeeListWithMembers extends EmployeeList {
    members: EmployeeListMember[];
}
export default function getEmployeeList(employeeListId: number): Promise<EmployeeListWithMembers | undefined>;
