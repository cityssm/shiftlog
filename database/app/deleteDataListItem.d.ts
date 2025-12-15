export interface DeleteDataListItemForm {
    dataListItemId: number;
    userName: string;
}
export default function deleteDataListItem(form: DeleteDataListItemForm): Promise<boolean>;
