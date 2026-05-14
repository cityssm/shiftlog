(() => {
    function removeIgnoredAttachment(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const fileChecksum = buttonElement.dataset.fileChecksum;
        if (fileChecksum === undefined || fileChecksum === '') {
            return;
        }
        bulmaJS.confirm({
            contextualColorName: 'danger',
            title: 'Remove Ignored Attachment',
            message: `Are you sure you want to remove checksum "${cityssm.escapeHTML(fileChecksum)}" from ignored attachments?`,
            okButton: {
                contextualColorName: 'danger',
                text: 'Remove',
                callbackFunction() {
                    cityssm.postJSON(`${exports.shiftLog.urlPrefix}/admin/doDeleteIgnoredAttachmentChecksum`, {
                        fileChecksum
                    }, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            document
                                .querySelector(`tr[data-file-checksum="${fileChecksum}"]`)
                                ?.remove();
                            if (document.querySelectorAll('.button--deleteIgnoredAttachment').length === 0) {
                                const containerElement = document.querySelector('#container--ignoredAttachments');
                                containerElement.innerHTML = `
                    <div class="message is-info" id="message--noIgnoredAttachments">
                      <div class="message-body">
                        There are no ignored attachment checksums.
                      </div>
                    </div>
                  `;
                            }
                            bulmaJS.alert({
                                contextualColorName: 'success',
                                message: 'Checksum removed from ignored attachments.'
                            });
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                message: responseJSON.message
                            });
                        }
                    });
                }
            }
        });
    }
    for (const buttonElement of document.querySelectorAll('.button--deleteIgnoredAttachment')) {
        buttonElement.addEventListener('click', removeIgnoredAttachment);
    }
})();
