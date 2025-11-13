export interface AddDataListItemForm {
    dataListKey: string;
    dataListItem: string;
    userName: string;
}
export default function addDataListItem(form: AddDataListItemForm): Promise<boolean>;
