export interface RecoverDataListForm {
    dataListKey: string;
    dataListName: string;
    userName: string;
}
export default function recoverDataList(form: RecoverDataListForm): Promise<boolean>;
