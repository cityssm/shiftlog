export interface DeleteDataListForm {
    dataListKey: string;
    userName: string;
}
export default function deleteDataList(form: DeleteDataListForm): Promise<boolean>;
