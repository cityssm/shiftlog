export interface UpdateWorkOrderForm {
    workOrderId: number | string;
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
export default function updateWorkOrder(updateWorkOrderForm: UpdateWorkOrderForm, userName: string): Promise<boolean>;
