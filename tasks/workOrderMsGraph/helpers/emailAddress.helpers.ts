import type { MsGraphMailMessage } from '@cityssm/ms-graph-mail'

import { getConfigProperty } from '../../../helpers/config.helpers.js'

const msGraphEmailAddress = (
  getConfigProperty('connectors.msGraph')?.targetUser ?? ''
).toLowerCase()

export function isEmailAddress(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/
  return emailRegex.test(value)
}

export function getSubscriberEmailAddresses(
  message: Pick<MsGraphMailMessage, 'ccRecipients' | 'toRecipients'>
): string[] {
  const emailAddresses: string[] = []

  for (const recipient of message.toRecipients ?? []) {
    if (
      !emailAddresses.includes(recipient.emailAddress.address) &&
      recipient.emailAddress.address.toLowerCase() !== msGraphEmailAddress
    ) {
      emailAddresses.push(recipient.emailAddress.address)
    }
  }

  for (const recipient of message.ccRecipients ?? []) {
    if (
      !emailAddresses.includes(recipient.emailAddress.address) &&
      recipient.emailAddress.address.toLowerCase() !== msGraphEmailAddress
    ) {
      emailAddresses.push(recipient.emailAddress.address)
    }
  }

  return emailAddresses
}
