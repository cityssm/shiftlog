export interface CreateWorkOrderForm {
    workOrderTypeDataListItemId: number | string;
    workOrderStatusDataListItemId?: number | string | null;
    workOrderDetails: string;
    workOrderOpenDateTimeString: string;
    workOrderDueDateTimeString?: string;
    workOrderCloseDateTimeString?: string;
    requestorName: string;
    requestorContactInfo: string;
    locationLatitude?: number | string | null;
    locationLongitude?: number | string | null;
    locationAddress1: string;
    locationAddress2: string;
    locationCityProvince: string;
    assignedToDataListItemId?: number | string | null;
    userGroupId?: number | string | null;
}
export default function createWorkOrder(createWorkOrderForm: CreateWorkOrderForm, userName: string): Promise<number>;
