(() => {
    function addIgnoredAttachment(submitEvent) {
        submitEvent.preventDefault();
        const formElement = submitEvent.currentTarget;
        const submitButton = document.querySelector('#button--submitAddIgnoredAttachment');
        if (submitButton === null) {
            return;
        }
        submitButton.disabled = true;
        submitButton.classList.add('is-loading');
        cityssm.postJSON(`${exports.shiftLog.urlPrefix}/admin/doAddIgnoredAttachmentChecksum`, formElement, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            submitButton.disabled = false;
            submitButton.classList.remove('is-loading');
            if (responseJSON.success) {
                bulmaJS.alert({
                    contextualColorName: 'success',
                    message: 'Checksum added to ignored attachments.',
                    okButton: {
                        callbackFunction() {
                            globalThis.location.reload();
                        }
                    }
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
                                .querySelector(`tr[data-file-checksum="${CSS.escape(fileChecksum)}"]`)
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
    document
        .querySelector('#form--addIgnoredAttachment')
        ?.addEventListener('submit', addIgnoredAttachment);
})();
