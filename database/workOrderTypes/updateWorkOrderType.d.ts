export interface UpdateWorkOrderTypeForm {
    defaultMilestones?: string;
    dueDays?: number | string;
    moreInfoFormNames?: string | string[];
    userGroupId?: number | string;
    workOrderNumberPrefix?: string;
    workOrderType: string;
    workOrderTypeId: number | string;
}
export default function updateWorkOrderType(form: UpdateWorkOrderTypeForm, userName: string): Promise<boolean>;
