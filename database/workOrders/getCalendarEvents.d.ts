export interface GetCalendarEventsFilters {
    year: number;
    month: number;
    assignedToDataListItemId?: number;
    showOpenDates: boolean;
    showDueDates: boolean;
    showCloseDates: boolean;
    showMilestoneDueDates: boolean;
    showMilestoneCompleteDates: boolean;
}
export interface WorkOrderCalendarEvent {
    eventDate: Date | string;
    eventType: 'milestoneComplete' | 'milestoneDue' | 'workOrderClose' | 'workOrderDue' | 'workOrderOpen';
    workOrderId: number;
    workOrderNumber: string;
    workOrderDetails: string;
    assignedToDataListItem?: string | null;
    assignedToDataListItemId?: number | null;
    milestoneId?: number | null;
    milestoneTitle?: string | null;
}
/**
 * Retrieves calendar events for work orders and milestones within a specified month.
 * @param filters - Filter parameters including year, month, date type toggles, and assigned to filter
 * @param user - Optional user object for applying user group security filtering.
 *               When provided, only work orders from work order types accessible to the user's groups are returned.
 * @returns Array of calendar events matching the specified filters
 */
export default function getCalendarEvents(filters: GetCalendarEventsFilters, user?: User): Promise<WorkOrderCalendarEvent[]>;
