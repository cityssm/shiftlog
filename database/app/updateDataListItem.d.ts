export interface UpdateDataListItemForm {
    colorHex?: string;
    dataListItem: string;
    dataListItemId: number;
    iconClass?: string;
    userGroupId?: number | string | null;
    userName: string;
}
export default function updateDataListItem(form: UpdateDataListItemForm): Promise<boolean>;
