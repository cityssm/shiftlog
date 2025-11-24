export interface CreateDataListForm {
    dataListKey: string;
    dataListName: string;
    isSystemList: boolean;
}
export default function createDataList(form: CreateDataListForm, userName: string): Promise<boolean>;
