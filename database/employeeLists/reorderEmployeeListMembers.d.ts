export interface ReorderEmployeeListMembersForm {
    employeeListId: number;
    employeeNumbers: string[];
    seniorityDate: string | undefined;
}
export default function reorderEmployeeListMembers(form: ReorderEmployeeListMembersForm): Promise<boolean>;
//# sourceMappingURL=reorderEmployeeListMembers.d.ts.map