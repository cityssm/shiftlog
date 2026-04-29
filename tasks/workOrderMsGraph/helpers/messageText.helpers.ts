import type { MsGraphMailMessage } from '@cityssm/ms-graph-mail'
import { NodeHtmlMarkdown } from 'node-html-markdown'

const htmlToTextConverter = new NodeHtmlMarkdown()

export const messageHeaderString = 'When replying to work order emails, please do not change the email subject line or the text below. This text is used by the system to link your email reply to the correct work order. If you change or delete this text, your email reply may not be processed correctly.'

export function messageBodyToText(
  messageBody: MsGraphMailMessage['body']
): string {
  const messageBodyTextUnsanitized = messageBody?.content ?? ''

  const messageBodyText =
    messageBody?.contentType === 'html' ||
    messageBodyTextUnsanitized.includes('<')
      ? htmlToTextConverter.translate(messageBodyTextUnsanitized)
      : messageBodyTextUnsanitized

  return messageBodyText
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
