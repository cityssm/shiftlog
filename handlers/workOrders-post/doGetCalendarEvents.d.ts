import type { Request, Response } from 'express';
import type { WorkOrderCalendarEvent } from '../../database/workOrders/getCalendarEvents.js';
export interface DoGetCalendarEventsRequest {
    year: number | string;
    month: number | string;
    assignedToId?: number | string;
    showOpenDates: boolean | string;
    showDueDates: boolean | string;
    showCloseDates: boolean | string;
    showMilestoneDueDates: boolean | string;
    showMilestoneCompleteDates: boolean | string;
}
export interface DoGetCalendarEventsResponse {
    success: boolean;
    events: WorkOrderCalendarEvent[];
}
export default function handler(request: Request<unknown, unknown, DoGetCalendarEventsRequest>, response: Response<DoGetCalendarEventsResponse>): Promise<void>;
