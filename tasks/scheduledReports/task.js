import { ScheduledTask } from '@cityssm/scheduled-task';
import { minutesToMillis } from '@cityssm/to-millis';
import Debug from 'debug';
import getAllActiveScheduledReports from '../../database/users/getAllActiveScheduledReports.js';
import updateScheduledReportLastSent from '../../database/users/updateScheduledReportLastSent.js';
import { getWorkOrdersForDigest } from '../../database/workOrders/getWorkOrdersForDigest.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { sendEmail } from '../../helpers/email.helpers.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:tasks:scheduledReports`);
const checkIntervalMinutes = 15;
/**
 * Calculates the next scheduled date/time for a report
 */
function calculateNextScheduledDateTime(report) {
    const now = new Date();
    const daysOfWeek = report.scheduleDaysOfWeek
        .split(',')
        .map((d) => Number.parseInt(d.trim(), 10))
        .filter((d) => d >= 0 && d <= 6);
    if (daysOfWeek.length === 0) {
        return undefined;
    }
    // Parse time
    const timeStr = typeof report.scheduleTimeOfDay === 'string'
        ? report.scheduleTimeOfDay
        : report.scheduleTimeOfDay.toISOString().slice(11, 19);
    const [hours, minutes] = timeStr.split(':').map((n) => Number.parseInt(n, 10));
    // Find the next occurrence
    for (let daysAhead = 0; daysAhead <= 7; daysAhead++) {
        const candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysAhead, hours, minutes, 0, 0);
        if (candidate <= now) {
            continue;
        }
        if (daysOfWeek.includes(candidate.getDay())) {
            return candidate;
        }
    }
    return undefined;
}
/**
 * Determines if a report should be sent now
 */
function shouldSendReport(report) {
    const now = new Date();
    const currentDayOfWeek = now.getDay();
    // Check if today is a scheduled day
    const scheduledDays = report.scheduleDaysOfWeek
        .split(',')
        .map((d) => Number.parseInt(d.trim(), 10));
    if (!scheduledDays.includes(currentDayOfWeek)) {
        return false;
    }
    // Check if already sent today
    if (report.lastSentDate) {
        const lastSentDate = typeof report.lastSentDate === 'string'
            ? new Date(report.lastSentDate)
            : report.lastSentDate;
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (lastSentDate.getFullYear() === today.getFullYear() &&
            lastSentDate.getMonth() === today.getMonth() &&
            lastSentDate.getDate() === today.getDate()) {
            return false;
        }
    }
    // Check if it's time to send
    const timeStr = typeof report.scheduleTimeOfDay === 'string'
        ? report.scheduleTimeOfDay
        : report.scheduleTimeOfDay.toISOString().slice(11, 19);
    const [scheduleHours, scheduleMinutes] = timeStr
        .split(':')
        .map((n) => Number.parseInt(n, 10));
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    // Send if current time is at or past the scheduled time
    if (currentHours > scheduleHours ||
        (currentHours === scheduleHours && currentMinutes >= scheduleMinutes)) {
        // Make sure we're within the check interval window
        const scheduledDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), scheduleHours, scheduleMinutes, 0, 0);
        const timeDiff = now.getTime() - scheduledDateTime.getTime();
        // Only send if we're within the check interval plus a buffer
        return timeDiff < minutesToMillis(checkIntervalMinutes + 5);
    }
    return false;
}
/**
 * Generates HTML content for the work order digest report
 */
async function generateWorkOrderDigestHTML(reportParameters) {
    const assignedToDataListItemId = reportParameters.assignedToDataListItemId;
    if (!assignedToDataListItemId) {
        return '<p>Error: Missing assignedToDataListItemId parameter</p>';
    }
    const digestData = await getWorkOrdersForDigest(assignedToDataListItemId);
    const workOrdersSectionName = getConfigProperty('workOrders.sectionName');
    const workOrderSingularName = getConfigProperty('workOrders.sectionNameSingular');
    let html = `
    <h1>${workOrdersSectionName} Digest</h1>
    <p><em>Generated: ${new Date().toLocaleString()}</em></p>
  `;
    if (digestData.workOrders.length === 0 && digestData.milestones.length === 0) {
        html += `<p>No open ${workOrdersSectionName.toLowerCase()} or milestones assigned.</p>`;
        return html;
    }
    if (digestData.workOrders.length > 0) {
        html += `<h2>Open ${workOrdersSectionName}</h2><table border="1" cellpadding="5" style="border-collapse: collapse; width: 100%;">
      <thead style="background-color: #f5f5f5;">
        <tr>
          <th>${workOrderSingularName} #</th>
          <th>Type</th>
          <th>Status</th>
          <th>Details</th>
          <th>Due Date</th>
        </tr>
      </thead>
      <tbody>`;
        for (const workOrder of digestData.workOrders) {
            const bgColor = workOrder.isOverdue
                ? '#ffdddd'
                : workOrder.isNew
                    ? '#ddeeff'
                    : '#ffffff';
            const badge = workOrder.isOverdue
                ? '<span style="background-color: #ff3860; color: white; padding: 2px 6px; border-radius: 3px; font-size: 0.8em;">Overdue</span>'
                : workOrder.isNew
                    ? '<span style="background-color: #3298dc; color: white; padding: 2px 6px; border-radius: 3px; font-size: 0.8em;">New</span>'
                    : '';
            html += `<tr style="background-color: ${bgColor};">
          <td><strong>${workOrder.workOrderNumber}</strong> ${badge}</td>
          <td>${workOrder.workOrderType ?? ''}</td>
          <td>${workOrder.workOrderStatusDataListItem ?? ''}</td>
          <td>${workOrder.workOrderDetails.substring(0, 100)}${workOrder.workOrderDetails.length > 100 ? '...' : ''}</td>
          <td>${workOrder.workOrderDueDateTime ? new Date(workOrder.workOrderDueDateTime).toLocaleString() : '(Not set)'}</td>
        </tr>`;
        }
        html += '</tbody></table><br/>';
    }
    if (digestData.milestones.length > 0) {
        html += `<h2>Open Milestones</h2><table border="1" cellpadding="5" style="border-collapse: collapse; width: 100%;">
      <thead style="background-color: #f5f5f5;">
        <tr>
          <th>${workOrderSingularName} #</th>
          <th>Milestone</th>
          <th>Description</th>
          <th>Due Date</th>
        </tr>
      </thead>
      <tbody>`;
        for (const milestone of digestData.milestones) {
            const bgColor = milestone.isOverdue
                ? '#ffdddd'
                : milestone.isNew
                    ? '#ddeeff'
                    : '#ffffff';
            const badge = milestone.isOverdue
                ? '<span style="background-color: #ff3860; color: white; padding: 2px 6px; border-radius: 3px; font-size: 0.8em;">Overdue</span>'
                : milestone.isNew
                    ? '<span style="background-color: #3298dc; color: white; padding: 2px 6px; border-radius: 3px; font-size: 0.8em;">New</span>'
                    : '';
            html += `<tr style="background-color: ${bgColor};">
          <td>${milestone.workOrderNumber}</td>
          <td>${milestone.milestoneTitle} ${badge}</td>
          <td>${milestone.milestoneDescription || ''}</td>
          <td>${milestone.milestoneDueDateTime ? new Date(milestone.milestoneDueDateTime).toLocaleString() : '(Not set)'}</td>
        </tr>`;
        }
        html += '</tbody></table><br/>';
    }
    html += `<p style="color: #666; font-size: 0.9em;">
    <strong>Legend:</strong>
    <span style="background-color: #ff3860; color: white; padding: 2px 6px; border-radius: 3px;">Overdue</span> Items past their due date &nbsp;
    <span style="background-color: #3298dc; color: white; padding: 2px 6px; border-radius: 3px;">New</span> Items created within the last 48 hours
  </p>`;
    return html;
}
/**
 * Processes a single scheduled report
 */
async function processScheduledReport(report) {
    try {
        debug(`Processing report: ${report.reportTitle} for ${report.userName}`);
        let html = '';
        let subject = report.reportTitle;
        // Generate report content based on type
        switch (report.reportType) {
            case 'workOrderDigest': {
                html = await generateWorkOrderDigestHTML(report.reportParametersJson ?? {});
                break;
            }
            default: {
                debug(`Unknown report type: ${report.reportType}`);
                return;
            }
        }
        // Send email
        // For now, we'll use the userName as the email address
        // In a real implementation, you'd look up the user's email from the database
        const emailResult = await sendEmail({
            to: report.userName, // Assuming userName is an email address
            subject,
            html
        });
        if (emailResult.success) {
            debug(`Successfully sent report ${report.scheduledReportId} to ${report.userName}`);
            // Update last sent timestamp
            const nextScheduledDateTime = calculateNextScheduledDateTime(report);
            await updateScheduledReportLastSent(report.scheduledReportId, nextScheduledDateTime);
        }
        else {
            debug(`Failed to send report ${report.scheduledReportId}: ${emailResult.error}`);
        }
    }
    catch (error) {
        debug(`Error processing report ${report.scheduledReportId}:`, error);
    }
}
/**
 * Main task function that checks and sends scheduled reports
 */
async function runScheduledReportsTask() {
    debug('Running scheduled reports task');
    try {
        const activeReports = await getAllActiveScheduledReports();
        debug(`Found ${activeReports.length} active scheduled reports`);
        for (const report of activeReports) {
            if (shouldSendReport(report)) {
                await processScheduledReport(report);
            }
            else {
                // Update next scheduled time if not set
                if (!report.nextScheduledDateTime) {
                    const nextScheduledDateTime = calculateNextScheduledDateTime(report);
                    if (nextScheduledDateTime) {
                        await updateScheduledReportLastSent(report.scheduledReportId, nextScheduledDateTime);
                    }
                }
            }
        }
        debug('Scheduled reports task completed');
    }
    catch (error) {
        debug('Error in scheduled reports task:', error);
    }
}
debug('Starting scheduled reports task');
// Run every 15 minutes
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const scheduledTask = new ScheduledTask('Scheduled Reports', runScheduledReportsTask, {
    schedule: {
        minute: [0, 15, 30, 45] // Run at :00, :15, :30, :45
    },
    minimumIntervalMillis: minutesToMillis(checkIntervalMinutes),
    startTask: true
});
debug(`Scheduled reports task initialized and will run every ${checkIntervalMinutes} minutes`);
