import type { MsGraphMailMessage } from '@cityssm/ms-graph-mail'
import { NodeHtmlMarkdown } from 'node-html-markdown'

const htmlToTextConverter = new NodeHtmlMarkdown()

export function messageBodyToText(
  messageBody: MsGraphMailMessage['body']
): string {
  if (messageBody === undefined) {
    return ''
  }

  if (messageBody.contentType === 'text') {
    return messageBody.content
  }

  return htmlToTextConverter.translate(messageBody.content)
}
