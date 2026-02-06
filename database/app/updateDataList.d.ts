export interface UpdateDataListForm {
    dataListKey: string;
    dataListName: string;
    userName: string;
}
export default function updateDataList(form: UpdateDataListForm): Promise<boolean>;
