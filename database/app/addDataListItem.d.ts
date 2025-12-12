export interface AddDataListItemForm {
    dataListKey: string;
    dataListItem: string;
    userGroupId?: number | string | null;
    userName: string;
}
export default function addDataListItem(form: AddDataListItemForm): Promise<boolean>;
