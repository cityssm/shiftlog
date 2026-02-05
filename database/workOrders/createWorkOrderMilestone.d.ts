export interface CreateWorkOrderMilestoneForm {
    workOrderId: number | string;
    milestoneTitle: string;
    milestoneDescription?: string;
    milestoneCompleteDateTimeString?: string;
    milestoneDueDateTimeString?: string;
    assignedToId?: number | string;
}
export default function createWorkOrderMilestone(form: CreateWorkOrderMilestoneForm, userName: string): Promise<number | undefined>;
