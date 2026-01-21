import nodemailer from 'nodemailer'

import { getWorkOrderUrl } from '../../../helpers/application.helpers.js'
import { getConfigProperty } from '../../../helpers/config.helpers.js'
import type { NotificationConfiguration } from '../../../types/record.types.js'
import { getWorkOrderToSend } from '../helpers/workOrder.helpers.js'
import type {
  EmailNotificationConfig,
  NotificationFunction,
  NotificationFunctionResult
} from '../types.js'

const emailConnectorConfig = getConfigProperty('connectors.email')

export const sendWorkOrderCreateEmailNotification: NotificationFunction =
  async (
    notificationConfiguration: NotificationConfiguration,
    workOrderId: number | string
  ): Promise<NotificationFunctionResult | undefined> => {
    if (emailConnectorConfig === undefined) {
      throw new Error('Email connector configuration is missing')
    }

    const workOrderToSend = await getWorkOrderToSend(
      workOrderId,
      notificationConfiguration
    )

    if (!workOrderToSend?.success) {
      return workOrderToSend
    }

    const workOrder = workOrderToSend.workOrder

    const emailSpecificConfig = JSON.parse(
      notificationConfiguration.notificationTypeFormJson
    ) as EmailNotificationConfig

    const transporter = nodemailer.createTransport({
      host: emailConnectorConfig.server,
      port: emailConnectorConfig.port ?? 587,

      auth: {
        user: emailConnectorConfig.userName,
        pass: emailConnectorConfig.password
      }
    })

    const response = await transporter.sendMail({
      from: emailConnectorConfig.fromAddress ?? 'no-reply@localhost',
      to: emailSpecificConfig.recipientEmails.join(', '),

      html: /* html */ `
        A new ${workOrder.workOrderType} has been created.<br />
        <br />
        ${getConfigProperty('workOrders.sectionNameSingular')} Number: ${workOrder.workOrderNumber}<br />
        <br />
        <a href="${getWorkOrderUrl(workOrder.workOrderId)}">
          View ${getConfigProperty('workOrders.sectionNameSingular')}
        </a>
      `,
      
      subject: `New ${workOrder.workOrderType}: ${workOrder.workOrderNumber}`
    })

    return response.rejected.length === 0
      ? { success: true }
      : {
          success: false,

          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          errorMessage: `Failed to send email to: ${response.rejected.join(
            ', '
          )}`
        }
  }

export const sendWorkOrderUpdateEmailNotification: NotificationFunction =
  async (
    notificationConfiguration: NotificationConfiguration,
    workOrderId: number | string
  ): Promise<NotificationFunctionResult | undefined> => {
    if (emailConnectorConfig === undefined) {
      throw new Error('Email connector configuration is missing')
    }

    const workOrderToSend = await getWorkOrderToSend(
      workOrderId,
      notificationConfiguration
    )

    if (!workOrderToSend?.success) {
      return workOrderToSend
    }

    const workOrder = workOrderToSend.workOrder

    const emailSpecificConfig = JSON.parse(
      notificationConfiguration.notificationTypeFormJson
    ) as EmailNotificationConfig

    const transporter = nodemailer.createTransport({
      host: emailConnectorConfig.server,
      port: emailConnectorConfig.port ?? 587,

      auth: {
        user: emailConnectorConfig.userName,
        pass: emailConnectorConfig.password
      }
    })

    const response = await transporter.sendMail({
      from: emailConnectorConfig.fromAddress ?? 'no-reply@localhost',
      to: emailSpecificConfig.recipientEmails.join(', '),

      html: /* html */ `
        The ${workOrder.workOrderType} has been updated.<br />
        <br />
        ${getConfigProperty('workOrders.sectionNameSingular')} Number: ${workOrder.workOrderNumber}<br />
        <br />
        <a href="${getWorkOrderUrl(workOrder.workOrderId)}">View ${getConfigProperty('workOrders.sectionNameSingular')}</a>
      `,
      subject: `Updated ${workOrder.workOrderType}: ${workOrder.workOrderNumber}`
    })

    return response.rejected.length === 0
      ? { success: true }
      : {
          success: false,

          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          errorMessage: `Failed to send email to: ${response.rejected.join(
            ', '
          )}`
        }
  }
