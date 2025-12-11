import { ScheduledTask } from '@cityssm/scheduled-task'
import { minutesToMillis } from '@cityssm/to-millis'
import Debug from 'debug'

import getAllActiveScheduledReports from '../../database/users/getAllActiveScheduledReports.js'
import updateScheduledReportLastSent from '../../database/users/updateScheduledReportLastSent.js'
import { getWorkOrdersForDigest } from '../../database/workOrders/getWorkOrdersForDigest.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { getApplicationUrl } from '../../helpers/application.helpers.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import { sendEmail } from '../../helpers/email.helpers.js'
import type { UserScheduledReport } from '../../types/record.types.js'

const debug = Debug(`${DEBUG_NAMESPACE}:tasks:scheduledReports`)

const checkIntervalMinutes = 15

/**
 * Calculates the next scheduled date/time for a report
 */
function calculateNextScheduledDateTime(
  report: UserScheduledReport
): Date | undefined {
  const now = new Date()
  const daysOfWeek = report.scheduleDaysOfWeek
    .split(',')
    .map((d) => Number.parseInt(d.trim(), 10))
    .filter((d) => d >= 0 && d <= 6)

  if (daysOfWeek.length === 0) {
    return undefined
  }

  // Parse time
  const timeString =
    typeof report.scheduleTimeOfDay === 'string'
      ? report.scheduleTimeOfDay
      : report.scheduleTimeOfDay.toISOString().slice(11, 19)

  const timeParts = timeString.split(':')
  if (timeParts.length < 2) {
    return undefined
  }

  const [hours, minutes] = timeParts.map((n) => Number.parseInt(n, 10))

  // Find the next occurrence (check up to 7 days ahead)
  for (let daysAhead = 0; daysAhead < 7; daysAhead += 1) {
    const candidate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + daysAhead,
      hours,
      minutes,
      0,
      0
    )

    if (candidate <= now) {
      continue
    }

    if (daysOfWeek.includes(candidate.getDay())) {
      return candidate
    }
  }

  return undefined
}

/**
 * Determines if a report should be sent now
 */
function shouldSendReport(report: UserScheduledReport): boolean {
  const now = new Date()
  const currentDayOfWeek = now.getDay()

  // Check if today is a scheduled day
  const scheduledDays = report.scheduleDaysOfWeek
    .split(',')
    .map((d) => Number.parseInt(d.trim(), 10))

  if (!scheduledDays.includes(currentDayOfWeek)) {
    return false
  }

  // Check if already sent today
  if (report.lastSentDate) {
    const lastSentDate =
      typeof report.lastSentDate === 'string'
        ? new Date(report.lastSentDate)
        : report.lastSentDate
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    if (
      lastSentDate.getFullYear() === today.getFullYear() &&
      lastSentDate.getMonth() === today.getMonth() &&
      lastSentDate.getDate() === today.getDate()
    ) {
      return false
    }
  }

  // Check if it's time to send
  const timeString =
    typeof report.scheduleTimeOfDay === 'string'
      ? report.scheduleTimeOfDay
      : report.scheduleTimeOfDay.toISOString().slice(11, 19)

  const timeParts = timeString.split(':')
  if (timeParts.length < 2) {
    return false
  }

  const [scheduleHours, scheduleMinutes] = timeParts.map((n) =>
    Number.parseInt(n, 10)
  )

  const currentHours = now.getHours()
  const currentMinutes = now.getMinutes()

  // Send if current time is at or past the scheduled time
  if (
    currentHours > scheduleHours ||
    (currentHours === scheduleHours && currentMinutes >= scheduleMinutes)
  ) {
    // Make sure we're within the check interval window
    const scheduledDateTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      scheduleHours,
      scheduleMinutes,
      0,
      0
    )
    const timeDiff = now.getTime() - scheduledDateTime.getTime()

    // Only send if we're within the check interval plus a buffer
    return timeDiff < minutesToMillis(checkIntervalMinutes + 5)
  }

  return false
}

/**
 * Generates digest counts and email content for the work order digest report
 */
async function generateWorkOrderDigestEmail(
  reportParameters: Record<string, unknown>,
  apiKey: string,
  applicationUrl: string
): Promise<{ html: string; overdueCount: number; newCount: number }> {
  const assignedToDataListItemId = reportParameters.assignedToDataListItemId as number | string | undefined

  if (!assignedToDataListItemId) {
    return {
      html: '<p>Error: Missing assignedToDataListItemId parameter</p>',
      overdueCount: 0,
      newCount: 0
    }
  }

  const digestData = await getWorkOrdersForDigest(
    assignedToDataListItemId as number | string
  )

  const workOrdersSectionName = getConfigProperty('workOrders.sectionName')

  // Calculate counts
  const overdueWorkOrdersCount = digestData.workOrders.filter(
    (wo) => wo.isOverdue
  ).length
  const newWorkOrdersCount = digestData.workOrders.filter(
    (wo) => wo.isNew
  ).length
  const overdueMilestonesCount = digestData.milestones.filter(
    (m) => m.isOverdue
  ).length
  const newMilestonesCount = digestData.milestones.filter((m) => m.isNew).length

  const totalOverdueCount = overdueWorkOrdersCount + overdueMilestonesCount
  const totalNewCount = newWorkOrdersCount + newMilestonesCount

  // Build the report URL
  // eslint-disable-next-line no-secrets/no-secrets
  const reportUrl = `${applicationUrl}${getConfigProperty('reverseProxy.urlPrefix')}/api/${apiKey}/workOrderDigest?assignedToDataListItemId=${assignedToDataListItemId}`

  // Generate simple HTML email with link
  let html = `
    <h2>${workOrdersSectionName} Digest</h2>
    <p>Your scheduled ${workOrdersSectionName.toLowerCase()} digest is ready.</p>
  `

  if (
    digestData.workOrders.length === 0 &&
    digestData.milestones.length === 0
  ) {
    html += `<p>No open ${workOrdersSectionName.toLowerCase()} or milestones assigned.</p>`
  } else {
    html += '<ul style="list-style: none; padding: 0;">'

    if (digestData.workOrders.length > 0) {
      html += `<li style="margin: 10px 0;">
        <strong>${digestData.workOrders.length}</strong> open ${workOrdersSectionName.toLowerCase()}`

      if (overdueWorkOrdersCount > 0 || newWorkOrdersCount > 0) {
        const parts: string[] = []
        if (overdueWorkOrdersCount > 0) {
          parts.push(
            `<span style="color: #ff3860; font-weight: bold;">${overdueWorkOrdersCount} overdue</span>`
          )
        }
        if (newWorkOrdersCount > 0) {
          parts.push(
            `<span style="color: #3298dc; font-weight: bold;">${newWorkOrdersCount} new</span>`
          )
        }
        html += ` (${parts.join(', ')})`
      }

      html += '</li>'
    }

    if (digestData.milestones.length > 0) {
      html += `<li style="margin: 10px 0;">
        <strong>${digestData.milestones.length}</strong> open milestones`

      if (overdueMilestonesCount > 0 || newMilestonesCount > 0) {
        const parts: string[] = []
        if (overdueMilestonesCount > 0) {
          parts.push(
            `<span style="color: #ff3860; font-weight: bold;">${overdueMilestonesCount} overdue</span>`
          )
        }
        if (newMilestonesCount > 0) {
          parts.push(
            `<span style="color: #3298dc; font-weight: bold;">${newMilestonesCount} new</span>`
          )
        }
        html += ` (${parts.join(', ')})`
      }

      html += '</li>'
    }

    html += '</ul>'

    html += `
      <p style="margin-top: 20px;">
        <a href="${reportUrl}" style="display: inline-block; padding: 10px 20px; background-color: #3298dc; color: white; text-decoration: none; border-radius: 4px;">
          View Full Digest Report
        </a>
      </p>
    `
  }

  html += `
    <p style="color: #666; font-size: 0.9em; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 10px;">
      <em>This is an automated digest from ${getConfigProperty('application.applicationName')}.</em>
    </p>
  `

  return {
    html,
    overdueCount: totalOverdueCount,
    newCount: totalNewCount
  }
}

/**
 * Processes a single scheduled report
 */
async function processScheduledReport(
  report: UserScheduledReport
): Promise<void> {
  try {
    debug(`Processing report: ${report.reportTitle} for ${report.userName}`)

    // Ensure the user has an API key
    const apiKey = report.apiKey
    if (!apiKey) {
      debug(`User ${report.userName} missing API key`)
      return

    }

    // Get application URL
    const applicationUrl = getApplicationUrl()

    let html = ''
    let subject = report.reportTitle
    let overdueCount = 0
    let newCount = 0

    // Generate report content based on type
    switch (report.reportType) {
      case 'workOrderDigest': {
        const emailData = await generateWorkOrderDigestEmail(
          report.reportParametersJson ?? {},
          apiKey,
          applicationUrl
        )
        html = emailData.html
        overdueCount = emailData.overdueCount
        newCount = emailData.newCount

        // Update subject line with counts
        const counts: string[] = []
        if (overdueCount > 0) {
          counts.push(`${overdueCount} overdue`)
        }
        if (newCount > 0) {
          counts.push(`${newCount} new`)
        }
        if (counts.length > 0) {
          subject = `${report.reportTitle} - ${counts.join(', ')}`
        }
        break
      }
      default: {
        debug(`Unknown report type: ${report.reportType}`)
        return
      }
    }

    // Send email
    // Note: This implementation assumes userName is a valid email address
    // In production, you should validate the email format or look up the user's email
    // from a separate email field in the Users table
    if (!report.userName || !report.userName.includes('@')) {
      debug(
        `Invalid email address for user ${report.userName}, skipping report`
      )
      return
    }

    const emailResult = await sendEmail({
      to: report.userName,
      subject,
      html
    })

    if (emailResult.success) {
      debug(
        `Successfully sent report ${report.scheduledReportId} to ${report.userName}`
      )

      // Update last sent timestamp
      const nextScheduledDateTime = calculateNextScheduledDateTime(report)
      await updateScheduledReportLastSent(
        report.scheduledReportId,
        nextScheduledDateTime,
        report.userName
      )
    } else {
      debug(
        `Failed to send report ${report.scheduledReportId}: ${emailResult.error}`
      )
    }
  } catch (error) {
    debug(`Error processing report ${report.scheduledReportId}:`, error)
  }
}

/**
 * Main task function that checks and sends scheduled reports
 */
async function runScheduledReportsTask(): Promise<void> {
  debug('Running scheduled reports task')

  try {
    const activeReports = await getAllActiveScheduledReports()
    debug(`Found ${activeReports.length} active scheduled reports`)

    for (const report of activeReports) {
      if (shouldSendReport(report)) {
        await processScheduledReport(report)
      } else {
        // Update next scheduled time if not set
        if (!report.nextScheduledDateTime) {
          const nextScheduledDateTime = calculateNextScheduledDateTime(report)
          if (nextScheduledDateTime) {
            await updateScheduledReportLastSent(
              report.scheduledReportId,
              nextScheduledDateTime,
              report.userName
            )
          }
        }
      }
    }

    debug('Scheduled reports task completed')
  } catch (error) {
    debug('Error in scheduled reports task:', error)
  }
}

debug('Starting scheduled reports task')

// Run every 15 minutes
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const scheduledTask = new ScheduledTask(
  'Scheduled Reports',
  runScheduledReportsTask,
  {
    schedule: {
      minute: [0, 15, 30, 45] // Run at :00, :15, :30, :45
    },

    minimumIntervalMillis: minutesToMillis(checkIntervalMinutes),

    startTask: true
  }
)

debug(
  `Scheduled reports task initialized and will run every ${checkIntervalMinutes} minutes`
)
