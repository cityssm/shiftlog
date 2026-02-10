export interface DefaultMilestoneUpdate {
    dueDays?: number | null;
    milestoneDescription: string;
    milestoneTitle: string;
    orderNumber: number;
}
export default function updateWorkOrderTypeDefaultMilestones(workOrderTypeId: number, defaultMilestones: DefaultMilestoneUpdate[]): Promise<boolean>;
