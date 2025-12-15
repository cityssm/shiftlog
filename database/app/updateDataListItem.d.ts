export interface UpdateDataListItemForm {
    dataListItemId: number;
    dataListItem: string;
    userGroupId?: number | string | null;
    userName: string;
}
export default function updateDataListItem(form: UpdateDataListItemForm): Promise<boolean>;
//# sourceMappingURL=updateDataListItem.d.ts.map