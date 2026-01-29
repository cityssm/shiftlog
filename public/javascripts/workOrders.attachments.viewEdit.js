(() => {
    const workOrderFormElement = document.querySelector('#form--workOrder');
    const workOrderId = workOrderFormElement === null
        ? ''
        : workOrderFormElement.querySelector('#workOrder--workOrderId').value;
    /*
     * Attachments functionality
     */
    const attachmentsContainerElement = document.querySelector('#container--attachments');
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- for safety
    if (attachmentsContainerElement === null) {
        return;
    }
    function formatFileSize(bytes) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const sizeIndex = Math.floor(Math.log(bytes) / Math.log(k));
        return `${Number.parseFloat((bytes / k ** sizeIndex).toFixed(2))} ${sizes[sizeIndex]}`;
    }
    function getFileIcon(fileType) {
        if (fileType.startsWith('image/')) {
            return 'fa-file-image';
        }
        else if (fileType === 'application/pdf') {
            return 'fa-file-pdf';
        }
        else if (fileType.includes('word') || fileType.includes('document')) {
            return 'fa-file-word';
        }
        else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
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
        <div
          class="message is-info"
        >
          <p class="message-body">No attachments have been added yet.</p>
        </div>
      `;
            return;
        }
        attachmentsContainerElement.innerHTML = '';
        for (const attachment of attachments) {
            const attachmentElement = document.createElement('div');
            attachmentElement.className = 'box';
            const canEdit = exports.isEdit &&
                (exports.shiftLog.userCanManageWorkOrders ||
                    attachment.recordCreate_userName === exports.shiftLog.userName);
            const fileIcon = getFileIcon(attachment.attachmentFileType);
            const isImage = attachment.attachmentFileType.startsWith('image/');
            // eslint-disable-next-line no-unsanitized/property
            attachmentElement.innerHTML = /* html */ `
        <article class="media">
          <figure class="media-left">
            <p class="image is-48x48">
              ${isImage
                ? /* html */ `
                    <img
                      src="${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/attachments/${attachment.workOrderAttachmentId}/inline"
                      alt="${cityssm.escapeHTML(attachment.attachmentFileName)}"
                      style="object-fit: cover; width: 48px; height: 48px;"
                      loading="lazy"
                    />
                  `
                : `
                    <span
                      class="icon is-large has-text-grey"
                    >
                      <i class="fa-solid ${fileIcon} fa-2x"></i>
                    </span>
                    `}
            </p>
          </figure>
          <div class="media-content">
            <div class="content">
              <p>
                <strong>
                  <a
                    href="${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/attachments/${attachment.workOrderAttachmentId}/download"
                    title="Download Attachment"
                    target="_blank"
                  >
                    ${cityssm.escapeHTML(attachment.attachmentFileName)}
                  </a>
                  ${attachment.isWorkOrderThumbnail
                ? /* html */ `
                        <span
                          class="tag is-info is-light ml-1"
                          title="Thumbnail"
                        >
                          <span class="icon is-small">
                            <i class="fa-solid fa-image"></i>
                          </span>
                          <span>Thumbnail</span>
                        </span>
                      `
                : ''}
                </strong>
                <br />
                <small class="has-text-grey">
                  ${formatFileSize(attachment.attachmentFileSizeInBytes)} &bull;
                  ${cityssm.escapeHTML(attachment.recordCreate_userName)} &bull;
                  ${cityssm.dateToString(new Date(attachment.recordCreate_dateTime))}
                </small>
                ${attachment.attachmentDescription
                ? `<br /><span class="is-size-7">${cityssm.escapeHTML(attachment.attachmentDescription)}</span>`
                : ''}
              </p>
            </div>
            ${canEdit && isImage && !attachment.isWorkOrderThumbnail
                ? /* html */ `
                  <div class="buttons">
                    <button
                      class="button is-small is-info is-light set-thumbnail"
                      data-attachment-id="${attachment.workOrderAttachmentId}"
                    >
                      <span class="icon is-small">
                        <i class="fa-solid fa-image"></i>
                      </span>
                      <span>Set as Thumbnail</span>
                    </button>
                  </div>
                `
                : ''}
            ${canEdit
                ? /* html */ `
                  <div class="buttons">
                    <button
                      class="button is-small is-light edit-attachment"
                      data-attachment-id="${attachment.workOrderAttachmentId}"
                      title="Edit Description"
                    >
                      <span class="icon is-small">
                        <i class="fa-solid fa-edit"></i>
                      </span>
                      <span>Edit Description</span>
                    </button>
                  </div>
                `
                : ''}
          </div>
          ${canEdit
                ? /* html */ `
                <div class="media-right">
                  <button
                    class="button is-small is-light is-danger delete-attachment"
                    data-attachment-id="${attachment.workOrderAttachmentId}"
                    title="Delete Attachment"
                  >
                    <span class="icon"><i class="fa-solid fa-trash"></i></span>
                  </button>
                </div>
              `
                : ''}
        </article>
      `;
            // Add event listeners
            if (canEdit) {
                const deleteLink = attachmentElement.querySelector('.delete-attachment');
                deleteLink.addEventListener('click', (event) => {
                    event.preventDefault();
                    deleteAttachment(attachment.workOrderAttachmentId);
                });
                const editLink = attachmentElement.querySelector('.edit-attachment');
                if (editLink !== null) {
                    editLink.addEventListener('click', (event) => {
                        event.preventDefault();
                        showEditAttachmentModal(attachment);
                    });
                }
                const setThumbnailLink = attachmentElement.querySelector('.set-thumbnail');
                if (setThumbnailLink !== null) {
                    setThumbnailLink.addEventListener('click', (event) => {
                        event.preventDefault();
                        setThumbnail(attachment.workOrderAttachmentId);
                    });
                }
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
                exports.shiftLog.setUnsavedChanges('modal');
                modalElement.querySelector('#addWorkOrderAttachment--workOrderId').value = workOrderId;
                // Display max file size
                const maxSizeElement = modalElement.querySelector('#addWorkOrderAttachment--maxSize');
                maxSizeElement.textContent = `Maximum file size: ${formatFileSize(exports.attachmentMaximumFileSizeBytes)}`;
                // Handle file selection display
                const fileInput = modalElement.querySelector('#addWorkOrderAttachment--attachmentFile');
                const fileNameSpan = modalElement.querySelector('#addWorkOrderAttachment--fileName');
                fileInput.addEventListener('change', () => {
                    fileNameSpan.textContent =
                        fileInput.files && fileInput.files.length > 0
                            ? fileInput.files[0].name
                            : 'No file selected';
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
                exports.shiftLog.clearUnsavedChanges('modal');
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function showEditAttachmentModal(attachment) {
        let closeModalFunction;
        function doUpdateAttachment(submitEvent) {
            submitEvent.preventDefault();
            const formElement = submitEvent.currentTarget;
            cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doUpdateWorkOrderAttachment`, formElement, (responseJSON) => {
                if (responseJSON.success) {
                    closeModalFunction();
                    loadAttachments();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        message: 'Failed to update attachment description.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('workOrders-editAttachment', {
            onshow(modalElement) {
                exports.shiftLog.setUnsavedChanges('modal');
                modalElement.querySelector('#editWorkOrderAttachment--workOrderAttachmentId').value = attachment.workOrderAttachmentId.toString();
                modalElement.querySelector('#editWorkOrderAttachment--attachmentDescription').value = attachment.attachmentDescription;
            },
            onshown(modalElement, _closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', doUpdateAttachment);
            },
            onremoved() {
                exports.shiftLog.clearUnsavedChanges('modal');
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
    function setThumbnail(workOrderAttachmentId) {
        cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doSetWorkOrderAttachmentThumbnail`, {
            workOrderAttachmentId
        }, (responseJSON) => {
            if (responseJSON.success) {
                loadAttachments();
                bulmaJS.alert({
                    contextualColorName: 'success',
                    message: 'Thumbnail set successfully.'
                });
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    message: 'Failed to set thumbnail.'
                });
            }
        });
    }
    function loadAttachments() {
        cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/${workOrderId}/doGetWorkOrderAttachments`, {}, (responseJSON) => {
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
})();
export {};
