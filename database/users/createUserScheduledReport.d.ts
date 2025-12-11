export interface CreateScheduledReportForm {
    reportType: string;
    reportTitle: string;
    reportParameters?: string;
    scheduleDaysOfWeek: string;
    scheduleTimeOfDay: string;
}
export default function createUserScheduledReport(userName: string, form: CreateScheduledReportForm, sessionUser: User): Promise<number>;
