export interface UpdateScheduledReportForm {
    scheduledReportId: number | string;
    reportTitle: string;
    reportParameters?: string;
    scheduleDaysOfWeek: string;
    scheduleTimeOfDay: string;
    isActive?: boolean | number | string;
}
export default function updateUserScheduledReport(userName: string, form: UpdateScheduledReportForm, sessionUser: User): Promise<boolean>;
