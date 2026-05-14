import getIgnoredAttachmentChecksums from '../../database/ignoredAttachmentChecksums/getIgnoredAttachmentChecksums.js';
export default async function handler(_request, response) {
    const ignoredAttachmentChecksums = await getIgnoredAttachmentChecksums();
    response.render('admin/ignoredAttachments', {
        headTitle: 'Ignored Attachment Management',
        section: 'admin',
        ignoredAttachmentChecksums
    });
}
