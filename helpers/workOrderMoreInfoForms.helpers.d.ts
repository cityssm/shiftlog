export interface WorkOrderMoreInfoForm {
    formName: string;
    formFields: Record<`moreInfo_${string}`, string>;
}
export declare const availableWorkOrderMoreInfoForms: Record<string, WorkOrderMoreInfoForm>;
