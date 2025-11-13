export interface UpdateDataListItemForm {
    dataListItemId: number;
    dataListItem: string;
    userGroupId?: number | null;
    userName: string;
}
export default function updateDataListItem(form: UpdateDataListItemForm): Promise<boolean>;
