export interface UpdateWorkOrderTypeForm {
    moreInfoFormNames?: string | string[];
    userGroupId?: number | string;
    workOrderNumberPrefix?: string;
    workOrderType: string;
    workOrderTypeId: number | string;
    defaultMilestones?: string;
}
export default function updateWorkOrderType(form: UpdateWorkOrderTypeForm, userName: string): Promise<boolean>;
