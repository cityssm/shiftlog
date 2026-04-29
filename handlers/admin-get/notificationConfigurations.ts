import type { Request, Response } from 'express'

import getAssignedToList from '../../database/assignedTo/getAssignedToList.js'
import getNotificationConfigurations from '../../database/notifications/getNotificationConfigurations.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import {
  type notificationQueueTypes,
  type NotificationType,
  notificationTypes
} from '../../tasks/notifications/types.js'

// Get configured notification protocols from config
const configuredProtocols = getConfigProperty('notifications.protocols')

// Filter notification types to only include configured protocols
const filteredNotificationTypes: readonly NotificationType[] =
  configuredProtocols.length > 0
    ? notificationTypes.filter((type) => configuredProtocols.includes(type))
    : []

const filteredNotificationQueueTypes = [
  'workOrder.create',
  'workOrder.update'
] satisfies Array<(typeof notificationQueueTypes)[number]>

export default async function handler(
  _request: Request,
  response: Response
): Promise<void> {
  const notificationConfigurations = await getNotificationConfigurations()
  const assignedToList = await getAssignedToList()

  response.render('admin/notificationConfigurations', {
    headTitle: 'Notification Configuration',
    section: 'admin',

    notificationConfigurations,

    assignedToList,
    notificationQueueTypes: filteredNotificationQueueTypes,
    notificationTypes: filteredNotificationTypes
  })
}
