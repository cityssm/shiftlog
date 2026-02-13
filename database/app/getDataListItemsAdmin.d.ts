export interface DataListItemWithDetails {
    dataListItemId: number;
    dataListKey: string;
    dataListItem: string;
    colorHex: string;
    iconClass: string;
    orderNumber: number;
    userGroupId: number | null;
}
export default function getDataListItemsAdmin(dataListKey: string): Promise<DataListItemWithDetails[]>;
