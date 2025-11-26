export interface MilestoneOrderUpdate {
    workOrderMilestoneId: number | string;
    orderNumber: number | string;
}
export default function updateWorkOrderMilestoneOrder(milestoneOrders: MilestoneOrderUpdate[], userName: string): Promise<boolean>;
