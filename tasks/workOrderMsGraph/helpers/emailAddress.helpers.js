import { getConfigProperty } from '../../../helpers/config.helpers.js';
const msGraphEmailAddress = (getConfigProperty('connectors.msGraph')?.targetUser ?? '').toLowerCase();
export function isEmailAddress(value) {
    const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/;
    return emailRegex.test(value);
}
export function getSubscriberEmailAddresses(message) {
    const emailAddresses = [];
    for (const recipient of message.toRecipients ?? []) {
        if (!emailAddresses.includes(recipient.emailAddress.address) &&
            recipient.emailAddress.address.toLowerCase() !== msGraphEmailAddress) {
            emailAddresses.push(recipient.emailAddress.address);
        }
    }
    for (const recipient of message.ccRecipients ?? []) {
        if (!emailAddresses.includes(recipient.emailAddress.address) &&
            recipient.emailAddress.address.toLowerCase() !== msGraphEmailAddress) {
            emailAddresses.push(recipient.emailAddress.address);
        }
    }
    return emailAddresses;
}
