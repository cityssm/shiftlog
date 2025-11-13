export interface UpdateDataListItemForm {
    dataListItemId: number;
    dataListItem: string;
    userName: string;
}
export default function updateDataListItem(form: UpdateDataListItemForm): Promise<boolean>;
