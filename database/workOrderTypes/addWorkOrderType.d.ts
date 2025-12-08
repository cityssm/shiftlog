export interface AddWorkOrderTypeForm {
    dueDays?: number | string;
    userGroupId?: number | string;
    workOrderNumberPrefix?: string;
    workOrderType: string;
}
export default function addWorkOrderType(form: AddWorkOrderTypeForm, userName: string): Promise<number>;
