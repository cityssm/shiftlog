export interface DataListItemWithDetails {
    colorHex: string;
    dataListItem: string;
    dataListItemId: number;
    dataListKey: string;
    iconClass: string;
    orderNumber: number;
    userGroupId: number | null;
}
export default function getDataListItemsAdmin(dataListKey: string): Promise<DataListItemWithDetails[]>;
