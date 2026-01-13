export interface CreateAssignedToForm {
    assignedToName: string;
    userGroupId?: number | string;
}
export default function createAssignedToItem(form: CreateAssignedToForm, userName: string): Promise<number>;
