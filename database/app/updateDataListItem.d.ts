export interface UpdateDataListItemForm {
    dataListItemId: number;
    dataListItem: string;
    colorHex?: string;
    iconClass?: string;
    userGroupId?: number | string | null;
    userName: string;
}
export default function updateDataListItem(form: UpdateDataListItemForm): Promise<boolean>;
