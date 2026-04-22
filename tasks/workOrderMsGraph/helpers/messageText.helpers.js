import { NodeHtmlMarkdown } from 'node-html-markdown';
const htmlToTextConverter = new NodeHtmlMarkdown();
export function messageBodyToText(messageBody) {
    if (messageBody === undefined) {
        return '';
    }
    if (messageBody.contentType === 'text') {
        return messageBody.content;
    }
    return htmlToTextConverter.translate(messageBody.content);
}
