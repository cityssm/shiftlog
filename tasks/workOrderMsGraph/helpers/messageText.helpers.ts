import type { MsGraphMailMessage } from '@cityssm/ms-graph-mail'
import { NodeHtmlMarkdown } from 'node-html-markdown'

const htmlToTextConverter = new NodeHtmlMarkdown()

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
