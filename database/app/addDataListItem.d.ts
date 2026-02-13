export interface AddDataListItemForm {
    colorHex?: string;
    dataListItem: string;
    dataListKey: string;
    iconClass?: string;
    userGroupId?: number | string | null;
    userName: string;
}
export default function addDataListItem(form: AddDataListItemForm): Promise<boolean>;
