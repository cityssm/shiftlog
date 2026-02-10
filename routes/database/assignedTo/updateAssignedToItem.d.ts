export interface UpdateAssignedToForm {
    assignedToId: number | string;
    assignedToName: string;
    userGroupId?: number | string;
}
export default function updateAssignedToItem(form: UpdateAssignedToForm, userName: string): Promise<boolean>;
