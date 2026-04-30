import type { MsGraphMailMessage } from '@cityssm/ms-graph-mail'
import { NodeHtmlMarkdown } from 'node-html-markdown'

import getLocations from '../../../database/locations/getLocations.js'
import type { Location } from '../../../types/record.types.js'

const htmlToTextConverter = new NodeHtmlMarkdown({
  maxConsecutiveNewlines: 2,
  useLinkReferenceDefinitions: true
})

export const messageHeaderString =
  'When replying to work order emails, please do not change the email subject line or the text below. This text is used by the system to link your email reply to the correct work order. If you change or delete this text, your email reply may not be processed correctly.'

export function messageBodyToText(
  messageBody: MsGraphMailMessage['body']
): string {
  const messageBodyTextUnsanitized = messageBody?.content ?? ''

  let messageBodyText =
    messageBody?.contentType === 'html' ||
    messageBodyTextUnsanitized.includes('<')
      ? htmlToTextConverter.translate(messageBodyTextUnsanitized)
      : messageBodyTextUnsanitized

  if (messageBodyText.includes(messageHeaderString)) {
    messageBodyText = messageBodyText.split(messageHeaderString)[0].trim()
  }

  if (messageBodyText.includes('---\n\n**From:**')) {
    messageBodyText = messageBodyText.split('---\n\n**From:**')[0].trim()
  }

  return messageBodyText
}

export async function messageTextToLocation(
  messageText: string
): Promise<Location | undefined> {
  const messageTextLowerCase = messageText.toLowerCase()

  const locations = await getLocations()

  for (const location of locations) {
    if (
      messageTextLowerCase.includes(location.address1.toLowerCase()) ||
      messageTextLowerCase.includes(location.address2.toLowerCase())
    ) {
      return location
    }
  }

  return undefined
}

export function messageSubjectToWorkOrderNumber(
  messageSubject: string
): string | undefined {
  // If subject contains "[#XX-2026-1234]", extract "XX-2026-1234" as the work order number
  const workOrderNumberMatch = /\[#(?<workOrderNumber>.{0,50})\]/.exec(
    messageSubject
  )

  return workOrderNumberMatch?.groups?.workOrderNumber
}
