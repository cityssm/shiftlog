export interface DataListItemWithDetails {
    dataListItemId: number;
    dataListKey: string;
    dataListItem: string;
    orderNumber: number;
    userGroupId: number | null;
}
export default function getDataListItemsAdmin(dataListKey: string): Promise<DataListItemWithDetails[]>;
//# sourceMappingURL=getDataListItemsAdmin.d.ts.map