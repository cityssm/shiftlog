import deleteIgnoredAttachmentChecksum from '../../database/ignoredAttachmentChecksums/deleteIgnoredAttachmentChecksum.js';
export default async function handler(request, response) {
    const success = await deleteIgnoredAttachmentChecksum(request.body.fileChecksum, request.session.user?.userName ?? '');
    if (success) {
        response.json({
            success: true
        });
    }
    else {
        response.json({
            success: false,
            message: 'Checksum could not be removed from ignored attachments.'
        });
    }
}
