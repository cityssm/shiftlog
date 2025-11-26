export interface UpdateWorkOrderMilestoneForm {
    workOrderMilestoneId: number | string;
    milestoneTitle: string;
    milestoneDescription?: string;
    milestoneDueDateTimeString?: string;
    milestoneCompleteDateTimeString?: string;
    assignedToDataListItemId?: number | string;
}
export default function updateWorkOrderMilestone(form: UpdateWorkOrderMilestoneForm, userName: string): Promise<boolean>;
