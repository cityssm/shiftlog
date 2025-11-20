import type { DateString, TimeString } from '@cityssm/utils-datetime';
export interface UpdateWorkOrderForm {
    workOrderId: number | string;
    workOrderDetails: string;
    workOrderStatusDataListItemId?: number | string;
    workOrderTypeDataListItemId: number | string;
    workOrderOpenDateTimeString: `${DateString} ${TimeString}` | `${DateString}T${TimeString}`;
    workOrderDueDateTimeString: '' | `${DateString} ${TimeString}` | `${DateString}T${TimeString}`;
    workOrderCloseDateTimeString: '' | `${DateString} ${TimeString}` | `${DateString}T${TimeString}`;
    requestorName: string;
    requestorContactInfo: string;
    locationLatitude?: number | string;
    locationLongitude?: number | string;
    locationAddress1: string;
    locationAddress2: string;
    locationCityProvince: string;
    assignedToDataListItemId?: number | string;
}
export default function updateWorkOrder(updateWorkOrderForm: UpdateWorkOrderForm, userName: string): Promise<boolean>;
