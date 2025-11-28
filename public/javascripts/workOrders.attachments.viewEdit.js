(() => {
    const workOrderFormElement = document.querySelector('#form--workOrder');
    const workOrderId = workOrderFormElement === null
        ? ''
        : workOrderFormElement.querySelector('#workOrder--workOrderId').value;
    /*
     * Attachments functionality
     */
    const attachmentsContainerElement = document.querySelector('#container--attachments');
    if (attachmentsContainerElement !== null) {
        function formatFileSize(bytes) {
            if (bytes === 0)
                return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
        }
        function getFileIcon(fileType) {
            if (fileType.startsWith('image/')) {
                return 'fa-file-image';
            }
            else if (fileType === 'application/pdf') {
                return 'fa-file-pdf';
            }
            else if (fileType.includes('word') ||
                fileType.includes('document')) {
                return 'fa-file-word';
            }
            else if (fileType.includes('excel') ||
                fileType.includes('spreadsheet')) {
                return 'fa-file-excel';
            }
            else if (fileType.includes('zip') || fileType.includes('archive')) {
                return 'fa-file-archive';
            }
            else if (fileType.startsWith('text/')) {
                return 'fa-file-alt';
            }
            return 'fa-file';
        }
        function renderAttachments(attachments) {
            // Update attachments count
            const attachmentsCountElement = document.querySelector('#attachmentsCount');
            if (attachmentsCountElement !== null) {
                attachmentsCountElement.textContent = attachments.length.toString();
            }
            if (attachments.length === 0) {
                attachmentsContainerElement.innerHTML = /* html */ `
          <div class="message is-info">
            <p class="message-body">No attachments have been added yet.</p>
          </div>
        `;
                return;
            }
            attachmentsContainerElement.innerHTML = '';
            for (const attachment of attachments) {
                const attachmentElement = document.createElement('div');
                attachmentElement.className = 'box';
                const canDelete = exports.shiftLog.userCanManageWorkOrders ||
                    attachment.recordCreate_userName === exports.shiftLog.userName;
                const fileIcon = getFileIcon(attachment.attachmentFileType);
                // eslint-disable-next-line no-unsanitized/property
                attachmentElement.innerHTML = /* html */ `
          <article class="media">
            <figure class="media-left">
              <p class="image is-48x48">
                <span class="icon is-large has-text-grey">
                  <i class="fa-solid ${fileIcon} fa-2x"></i>
                </span>
              </p>
            </figure>
            <div class="media-content">
              <div class="content">
                <p>
                  <strong>
                    <a href="${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/attachments/${attachment.workOrderAttachmentId}/download" target="_blank">
                      ${cityssm.escapeHTML(attachment.attachmentFileName)}
                    </a>
                  </strong>
                  <br />
                  <small class="has-text-grey">
                    ${formatFileSize(attachment.attachmentFileSizeInBytes)}
                    &bull;
                    ${cityssm.escapeHTML(attachment.recordCreate_userName)}
                    &bull;
                    ${cityssm.dateToString(new Date(attachment.recordCreate_dateTime))}
                  </small>
                  ${attachment.attachmentDescription
                    ? `<br /><span class="is-size-7">${cityssm.escapeHTML(attachment.attachmentDescription)}</span>`
                    : ''}
                </p>
              </div>
              ${canDelete
                    ? /* html */ `
                    <nav class="level is-mobile">
                      <div class="level-left">
                        <a class="level-item download-attachment" href="${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/attachments/${attachment.workOrderAttachmentId}/download" target="_blank">
                          <span class="icon is-small"><i class="fa-solid fa-download"></i></span>
                        </a>
                        <a class="level-item delete-attachment" data-attachment-id="${attachment.workOrderAttachmentId}">
                          <span class="icon is-small has-text-danger"><i class="fa-solid fa-trash"></i></span>
                        </a>
                      </div>
                    </nav>
                  `
                    : /* html */ `
                    <nav class="level is-mobile">
                      <div class="level-left">
                        <a class="level-item download-attachment" href="${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/attachments/${attachment.workOrderAttachmentId}/download" target="_blank">
                          <span class="icon is-small"><i class="fa-solid fa-download"></i></span>
                        </a>
                      </div>
                    </nav>
                  `}
            </div>
          </article>
        `;
                // Add event listeners
                if (canDelete) {
                    const deleteLink = attachmentElement.querySelector('.delete-attachment');
                    deleteLink.addEventListener('click', (event) => {
                        event.preventDefault();
                        deleteAttachment(attachment.workOrderAttachmentId);
                    });
                }
                attachmentsContainerElement.append(attachmentElement);
            }
        }
        function showAddAttachmentModal() {
            let closeModalFunction;
            function doAddAttachment(submitEvent) {
                submitEvent.preventDefault();
                const formElement = submitEvent.currentTarget;
                const fileInput = formElement.querySelector('#addWorkOrderAttachment--attachmentFile');
                if (!fileInput.files || fileInput.files.length === 0) {
                    bulmaJS.alert({
                        contextualColorName: 'warning',
                        message: 'Please select a file to upload.'
                    });
                    return;
                }
                const file = fileInput.files[0];
                if (file.size > exports.attachmentMaximumFileSizeBytes) {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        message: `File size exceeds the maximum allowed size of ${formatFileSize(exports.attachmentMaximumFileSizeBytes)}.`
                    });
                    return;
                }
                const submitButton = document.querySelector('#button--submitAttachment');
                submitButton.disabled = true;
                submitButton.classList.add('is-loading');
                const formData = new FormData(formElement);
                globalThis
                    .fetch(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doUploadWorkOrderAttachment`, {
                    method: 'POST',
                    body: formData
                })
                    .then(async (response) => response.json())
                    .then((responseJSON) => {
                    submitButton.disabled = false;
                    submitButton.classList.remove('is-loading');
                    if (responseJSON.success) {
                        closeModalFunction();
                        loadAttachments();
                    }
                    else {
                        bulmaJS.alert({
                            contextualColorName: 'danger',
                            message: responseJSON.message || 'Failed to upload attachment.'
                        });
                    }
                })
                    .catch(() => {
                    submitButton.disabled = false;
                    submitButton.classList.remove('is-loading');
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        message: 'Failed to upload attachment.'
                    });
                });
            }
            cityssm.openHtmlModal('workOrders-addAttachment', {
                onshow(modalElement) {
                    ;
                    modalElement.querySelector('#addWorkOrderAttachment--workOrderId').value = workOrderId;
                    // Display max file size
                    const maxSizeElement = modalElement.querySelector('#addWorkOrderAttachment--maxSize');
                    maxSizeElement.textContent = `Maximum file size: ${formatFileSize(exports.attachmentMaximumFileSizeBytes)}`;
                    // Handle file selection display
                    const fileInput = modalElement.querySelector('#addWorkOrderAttachment--attachmentFile');
                    const fileNameSpan = modalElement.querySelector('#addWorkOrderAttachment--fileName');
                    fileInput.addEventListener('change', () => {
                        if (fileInput.files && fileInput.files.length > 0) {
                            fileNameSpan.textContent = fileInput.files[0].name;
                        }
                        else {
                            fileNameSpan.textContent = 'No file selected';
                        }
                    });
                },
                onshown(modalElement, _closeModalFunction) {
                    bulmaJS.toggleHtmlClipped();
                    closeModalFunction = _closeModalFunction;
                    modalElement
                        .querySelector('form')
                        ?.addEventListener('submit', doAddAttachment);
                },
                onremoved() {
                    bulmaJS.toggleHtmlClipped();
                }
            });
        }
        function deleteAttachment(workOrderAttachmentId) {
            bulmaJS.confirm({
                contextualColorName: 'danger',
                title: 'Delete Attachment',
                message: 'Are you sure you want to delete this attachment?',
                okButton: {
                    text: 'Delete',
                    callbackFunction: () => {
                        cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doDeleteWorkOrderAttachment`, {
                            workOrderAttachmentId
                        }, (responseJSON) => {
                            if (responseJSON.success) {
                                loadAttachments();
                            }
                            else {
                                bulmaJS.alert({
                                    contextualColorName: 'danger',
                                    message: 'Failed to delete attachment.'
                                });
                            }
                        });
                    }
                }
            });
        }
        function loadAttachments() {
            cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/${workOrderId}/doGetWorkOrderAttachments`, {}, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    renderAttachments(responseJSON.attachments);
                }
            });
        }
        // Add attachment button
        const addAttachmentButton = document.querySelector('#button--addAttachment');
        if (addAttachmentButton !== null) {
            addAttachmentButton.addEventListener('click', () => {
                showAddAttachmentModal();
            });
        }
        // Load attachments initially
        loadAttachments();
    }
})();
