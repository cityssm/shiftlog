import { NodeHtmlMarkdown } from 'node-html-markdown';
const htmlToTextConverter = new NodeHtmlMarkdown();
export function messageBodyToText(messageBody) {
    const messageBodyTextUnsanitized = messageBody?.content ?? '';
    const messageBodyText = messageBody?.contentType === 'html' ||
        messageBodyTextUnsanitized.includes('<')
        ? htmlToTextConverter.translate(messageBodyTextUnsanitized)
        : messageBodyTextUnsanitized;
    return messageBodyText;
}
export function messageSubjectToWorkOrderNumber(messageSubject) {
    const workOrderNumberMatch = /\[#(?<workOrderNumber>.{0,50})\]/.exec(messageSubject);
    return workOrderNumberMatch?.groups?.workOrderNumber;
}
