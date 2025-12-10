export interface CreateWorkOrderCostForm {
    workOrderId: number | string;
    costAmount: number | string;
    costDescription: string;
}
export default function createWorkOrderCost(createWorkOrderCostForm: CreateWorkOrderCostForm, userName: string): Promise<number>;
