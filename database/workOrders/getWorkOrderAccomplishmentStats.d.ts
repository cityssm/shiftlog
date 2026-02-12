export interface WorkOrderAccomplishmentStats {
    percentClosed: number;
    totalClosed: number;
    totalOpen: number;
    totalOverdue: number;
}
export interface WorkOrderTimeSeriesData {
    closedCount: number;
    openCount: number;
    periodLabel: string;
}
export interface WorkOrderByAssignedTo {
    assignedToName: string;
    closedCount: number;
    openedCount: number;
}
export interface WorkOrderTagStatistic {
    count: number;
    tagName: string;
}
export interface WorkOrderHotZone {
    closedCount: number;
    count: number;
    latitude: number;
    longitude: number;
    openCount: number;
}
export interface WorkOrderAccomplishmentData {
    byAssignedTo: WorkOrderByAssignedTo[];
    hotZones: WorkOrderHotZone[];
    stats: WorkOrderAccomplishmentStats;
    tags: WorkOrderTagStatistic[];
    timeSeries: WorkOrderTimeSeriesData[];
}
/**
 * Get work order accomplishment statistics for a date range
 * @param startDate - Start date for the period
 * @param endDate - End date for the period
 * @param filterType - 'month' or 'year' for time series grouping
 * @param user - Optional user for permission filtering
 * @returns Work order accomplishment data
 */
export default function getWorkOrderAccomplishmentStats(startDate: Date, endDate: Date, filterType: 'month' | 'year', user?: User): Promise<WorkOrderAccomplishmentData>;
