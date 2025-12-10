export interface UpdateWorkOrderCostForm {
    workOrderCostId: number | string;
    costAmount: number | string;
    costDescription: string;
}
export default function updateWorkOrderCost(updateWorkOrderCostForm: UpdateWorkOrderCostForm, userName: string): Promise<boolean>;
