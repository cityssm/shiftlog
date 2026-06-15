import type { MsGraphMailMessage } from '@cityssm/ms-graph-mail'

import { getCachedSettingValue } from '../../../helpers/cache/settings.cache.js'
import { getConfigProperty } from '../../../helpers/config.helpers.js'

const msGraphEmailAddress = (
  getConfigProperty('connectors.msGraph')?.targetUser ?? ''
).toLowerCase()

const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/

export function isEmailAddress(value: string): boolean {
  return emailRegex.test(value)
}

export function getSubscriberEmailAddresses(
  message: Pick<MsGraphMailMessage, 'ccRecipients' | 'replyTo' | 'toRecipients'>
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

  for (const recipient of message.replyTo ?? []) {
    if (
      !emailAddresses.includes(recipient.emailAddress.address) &&
      recipient.emailAddress.address.toLowerCase() !== msGraphEmailAddress
    ) {
      emailAddresses.push(recipient.emailAddress.address)
    }
  }

  return emailAddresses
}

export function isNoReplyEmailAddress(
  emailAddress: string,
  name = ''
): boolean {
  const lowercaseEmail = emailAddress.toLowerCase()
  const lowercaseName = name.toLowerCase()

  return (
    (isEmailAddress(lowercaseEmail) &&
      (lowercaseEmail.includes('noreply') ||
        lowercaseEmail.includes('no-reply') ||
        lowercaseEmail === msGraphEmailAddress)) ||
    lowercaseName.includes('noreply') ||
    lowercaseName.includes('no-reply') ||
    lowercaseName.includes('do not reply') ||
    lowercaseName.includes('donotreply')
  )
}

export async function isBlockedToEmailAddress(
  emailAddress: string
): Promise<boolean> {
  const lowercaseEmail = emailAddress.toLowerCase()

  const blockedEmailAddressesSetting = await getCachedSettingValue(
    'msGraph.to.blockedEmailAddresses'
  )

  if (blockedEmailAddressesSetting.trim() !== '') {
    const blockedEmailAddresses = blockedEmailAddressesSetting
      .split(',')
      .map((address) => address.trim().toLowerCase())

    if (blockedEmailAddresses.includes(lowercaseEmail)) {
      return true
    }
  }

  const blockedEmailAddressDomainsSetting = await getCachedSettingValue(
    'msGraph.to.blockedDomains'
  )

  if (blockedEmailAddressDomainsSetting.trim() !== '') {
    const blockedEmailAddressDomains = blockedEmailAddressDomainsSetting
      .split(',')
      .map((domain) => domain.trim().toLowerCase())

    return blockedEmailAddressDomains.some((blockedDomain) =>
      lowercaseEmail.endsWith(`@${blockedDomain}`)
    )
  }

  return false
}
