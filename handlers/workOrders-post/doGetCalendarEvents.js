import getCalendarEvents from '../../database/workOrders/getCalendarEvents.js';
export default async function handler(request, response) {
    const year = typeof request.body.year === 'number'
        ? request.body.year
        : Number.parseInt(request.body.year, 10);
    const month = typeof request.body.month === 'number'
        ? request.body.month
        : Number.parseInt(request.body.month, 10);
    const assignedToDataListItemId = request.body.assignedToDataListItemId === undefined ||
        request.body.assignedToDataListItemId === ''
        ? undefined
        : typeof request.body.assignedToDataListItemId === 'number'
            ? request.body.assignedToDataListItemId
            : Number.parseInt(request.body.assignedToDataListItemId, 10);
    const showOpenDates = typeof request.body.showOpenDates === 'boolean'
        ? request.body.showOpenDates
        : request.body.showOpenDates === 'true';
    const showDueDates = typeof request.body.showDueDates === 'boolean'
        ? request.body.showDueDates
        : request.body.showDueDates === 'true';
    const showCloseDates = typeof request.body.showCloseDates === 'boolean'
        ? request.body.showCloseDates
        : request.body.showCloseDates === 'true';
    const showMilestoneDueDates = typeof request.body.showMilestoneDueDates === 'boolean'
        ? request.body.showMilestoneDueDates
        : request.body.showMilestoneDueDates === 'true';
    const showMilestoneCompleteDates = typeof request.body.showMilestoneCompleteDates === 'boolean'
        ? request.body.showMilestoneCompleteDates
        : request.body.showMilestoneCompleteDates === 'true';
    const events = await getCalendarEvents({
        year,
        month,
        assignedToDataListItemId,
        showOpenDates,
        showDueDates,
        showCloseDates,
        showMilestoneDueDates,
        showMilestoneCompleteDates
    }, request.session.user);
    response.json({
        success: true,
        events
    });
}
