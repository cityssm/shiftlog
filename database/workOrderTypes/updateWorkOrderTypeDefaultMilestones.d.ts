export interface DefaultMilestoneUpdate {
    milestoneTitle: string;
    milestoneDescription: string;
    orderNumber: number;
}
export default function updateWorkOrderTypeDefaultMilestones(workOrderTypeId: number, defaultMilestones: DefaultMilestoneUpdate[]): Promise<boolean>;
