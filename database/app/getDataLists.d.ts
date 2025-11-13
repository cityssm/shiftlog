export interface DataList {
    dataListKey: string;
    dataListName: string;
    isSystemList: boolean;
}
export default function getDataLists(): Promise<DataList[]>;
