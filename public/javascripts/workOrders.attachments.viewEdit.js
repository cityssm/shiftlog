(() => {
    const workOrderFormElement = document.querySelector('#form--workOrder');
    const workOrderId = workOrderFormElement === null
        ? ''
        : workOrderFormElement.querySelector('#workOrder--workOrderId').value;
    const attachmentsContainerElement = document.querySelector('#container--attachments');
    const userCanIgnoreAttachmentsInFuture = exports.shiftLog.isAdmin && exports.shiftLog.userCanManageWorkOrders;
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
    function hasFileChecksum(fileChecksum) {
        return fileChecksum.trim() !== '';
    }
    function renderAttachments(attachments) {
        const attachmentsCountElement = document.querySelector('#attachmentsCount');
        if (attachmentsCountElement !== null) {
            attachmentsCountElement.textContent = attachments.length.toString();
        }
        if (attachments.length === 0) {
            attachmentsContainerElement.innerHTML = `
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
            const attachmentDescriptionHTML = attachment.attachmentDescription
                ? DOMPurify.sanitize(marked.parse(attachment.attachmentDescription))
                : '';
            const hasIgnoredAttachmentNote = attachment.ignoredAttachmentNoteText !== undefined &&
                attachment.ignoredAttachmentNoteText !== null &&
                attachment.ignoredAttachmentNoteText !== '';
            const hasChecksum = hasFileChecksum(attachment.fileChecksum);
            const ignoredAttachmentTagHTML = hasIgnoredAttachmentNote
                ? `
          <button
            class="tag is-warning is-light ml-1 ignored-attachment-tag"
            data-file-checksum="${cityssm.escapeHTML(attachment.fileChecksum)}"
            data-note-text="${cityssm.escapeHTML(attachment.ignoredAttachmentNoteText)}"
            type="button"
            title="Attachment is ignored in future imports"
          >
            <span class="icon is-small">
              <i class="fa-solid fa-ban"></i>
            </span>
            <span>Ignored in Future</span>
          </button>
        `
                : '';
            let ignoreAttachmentButtonHTML = '';
            if (userCanIgnoreAttachmentsInFuture &&
                hasChecksum &&
                !hasIgnoredAttachmentNote) {
                ignoreAttachmentButtonHTML = `
          <div class="dropdown is-right">
            <div class="dropdown-trigger">
              <button
                class="button is-small"
                type="button"
                title="More Actions"
              >
                <span class="icon is-small">
                  <i class="fa-solid fa-ellipsis-vertical"></i>
                </span>
              </button>
            </div>
            <div class="dropdown-menu">
              <div class="dropdown-content">
                <button
                  class="dropdown-item ignore-attachment"
                  data-attachment-id="${attachment.workOrderAttachmentId}"
                  type="button"
                >
                  <span class="icon is-small">
                    <i class="fa-solid fa-ban"></i>
                  </span>
                  <span>Ignore Attachment in Future</span>
                </button>
              </div>
            </div>
          </div>
        `;
            }
            attachmentElement.innerHTML = `
        <article class="media">
          <figure class="media-left">
            <p class="image is-48x48">
              ${isImage
                ? `
                    <img
                      src="${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/attachments/${attachment.workOrderAttachmentId}/inline?maxWidth=96&maxHeight=96"
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
                ? `
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
                  ${ignoredAttachmentTagHTML}
                </strong>
                <br />
                <small class="has-text-grey">
                  ${formatFileSize(attachment.attachmentFileSizeInBytes)} &bull;
                  ${cityssm.escapeHTML(attachment.recordCreate_userName ?? '')} &bull;
                  ${cityssm.dateToString(new Date(attachment.recordCreate_dateTime ?? ''))}
                </small>
                ${attachmentDescriptionHTML
                ? `<div class="content is-size-7 mt-1">${attachmentDescriptionHTML}</div>`
                : ''}
              </p>
            </div>
            ${canEdit && isImage && !attachment.isWorkOrderThumbnail
                ? `
                  <div class="buttons">
                    <button
                      class="button is-small is-info is-light set-thumbnail"
                      data-attachment-id="${attachment.workOrderAttachmentId}"
                      type="button"
                    >
                      <span class="icon is-small">
                        <i class="fa-solid fa-image"></i>
                      </span>
                      <span>Set as Thumbnail</span>
                    </button>
                  </div>
                `
                : ''}
          </div>
          ${canEdit
                ? `
                <div class="media-right">
                  <div class="buttons">
                    <button
                      class="button is-small edit-attachment"
                      data-attachment-id="${attachment.workOrderAttachmentId}"
                      type="button"
                      title="Edit Description"
                    >
                      <span class="icon is-small">
                        <i class="fa-solid fa-edit"></i>
                      </span>
                      <span>Edit Description</span>
                    </button>
                    ${ignoreAttachmentButtonHTML}
                    <button
                      class="button is-small is-light is-danger delete-attachment"
                      data-attachment-id="${attachment.workOrderAttachmentId}"
                      type="button"
                      title="Delete Attachment"
                    >
                      <span class="icon"><i class="fa-solid fa-trash"></i></span>
                    </button>
                  </div>
                </div>
              `
                : ''}
        </article>
      `;
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
                const ignoreAttachmentLink = attachmentElement.querySelector('.ignore-attachment');
                if (ignoreAttachmentLink !== null) {
                    ignoreAttachmentLink.addEventListener('click', (event) => {
                        event.preventDefault();
                        showIgnoreAttachmentModal(attachment);
                    });
                }
            }
            const ignoredAttachmentTag = attachmentElement.querySelector('.ignored-attachment-tag');
            if (ignoredAttachmentTag !== null) {
                ignoredAttachmentTag.addEventListener('click', (event) => {
                    event.preventDefault();
                    showIgnoredAttachmentModal(attachment.ignoredAttachmentNoteText ?? '', attachment.fileChecksum);
                });
            }
            attachmentsContainerElement.append(attachmentElement);
        }
        bulmaJS.init(attachmentsContainerElement);
    }
    function showIgnoreAttachmentModal(attachment) {
        let closeModalFunction;
        function doIgnoreAttachment(submitEvent) {
            submitEvent.preventDefault();
            const formElement = submitEvent.currentTarget;
            const submitButton = document.querySelector('#button--submitIgnoreAttachment');
            if (submitButton === null) {
                return;
            }
            submitButton.disabled = true;
            submitButton.classList.add('is-loading');
            cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doIgnoreWorkOrderAttachment`, formElement, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                submitButton.disabled = false;
                submitButton.classList.remove('is-loading');
                if (responseJSON.success) {
                    closeModalFunction();
                    loadAttachments();
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        message: 'Attachment checksum added to ignored attachments.'
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
        cityssm.openHtmlModal('workOrders-ignoreAttachment', {
            onshow(modalElement) {
                exports.shiftLog.setUnsavedChanges('modal');
                modalElement.querySelector('#ignoreWorkOrderAttachment--workOrderAttachmentId').value = attachment.workOrderAttachmentId.toString();
                modalElement.querySelector('#ignoreWorkOrderAttachment--attachmentFileName').textContent = attachment.attachmentFileName;
                modalElement.querySelector('#ignoreWorkOrderAttachment--fileChecksum').textContent = attachment.fileChecksum;
            },
            onshown(modalElement, _closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', doIgnoreAttachment);
            },
            onremoved() {
                exports.shiftLog.clearUnsavedChanges('modal');
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function showIgnoredAttachmentModal(noteText, fileChecksum) {
        const fileChecksumFieldKey = 'fileChecksum';
        const fileChecksumSelector = `#viewIgnoredWorkOrderAttachment--${fileChecksumFieldKey}`;
        cityssm.openHtmlModal('workOrders-viewIgnoredAttachment', {
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            },
            onshow(modalElement) {
                ;
                modalElement.querySelector(fileChecksumSelector).textContent = fileChecksum;
                modalElement.querySelector('#viewIgnoredWorkOrderAttachment--noteText').textContent = noteText;
            },
            onshown() {
                bulmaJS.toggleHtmlClipped();
            }
        });
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
                body: formData,
                method: 'POST'
            })
                .then(async (response) => (await response.json()))
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
                const maxSizeElement = modalElement.querySelector('#addWorkOrderAttachment--maxSize');
                maxSizeElement.textContent = `Maximum file size: ${formatFileSize(exports.attachmentMaximumFileSizeBytes)}`;
                const fileInput = modalElement.querySelector('#addWorkOrderAttachment--attachmentFile');
                const fileNameSpan = modalElement.querySelector('#addWorkOrderAttachment--fileName');
                fileInput.addEventListener('change', () => {
                    fileNameSpan.textContent =
                        fileInput.files && fileInput.files.length > 0
                            ? fileInput.files[0].name
                            : 'No file selected';
                });
                const descriptionTextarea = modalElement.querySelector('#addWorkOrderAttachment--attachmentDescription');
                const transcriptionField = modalElement.querySelector('#field--addWorkOrderAttachment--generateWithTranscription');
                const transcriptionCheckbox = modalElement.querySelector('#addWorkOrderAttachment--generateWithTranscription');
                if (exports.transcriptionsEnabled) {
                    transcriptionField.classList.remove('is-hidden');
                    const toggleDescriptionState = () => {
                        descriptionTextarea.disabled = transcriptionCheckbox.checked;
                    };
                    transcriptionCheckbox.addEventListener('change', toggleDescriptionState);
                    toggleDescriptionState();
                }
                else {
                    transcriptionField.classList.add('is-hidden');
                    transcriptionCheckbox.checked = false;
                    descriptionTextarea.disabled = false;
                }
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
            cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doUpdateWorkOrderAttachment`, formElement, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
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
                const descriptionTextarea = modalElement.querySelector('#editWorkOrderAttachment--attachmentDescription');
                const transcriptionField = modalElement.querySelector('#field--editWorkOrderAttachment--generateWithTranscription');
                const transcriptionCheckbox = modalElement.querySelector('#editWorkOrderAttachment--generateWithTranscription');
                if (exports.transcriptionsEnabled) {
                    transcriptionField.classList.remove('is-hidden');
                    const toggleDescriptionState = () => {
                        descriptionTextarea.disabled = transcriptionCheckbox.checked;
                    };
                    transcriptionCheckbox.addEventListener('change', toggleDescriptionState);
                    toggleDescriptionState();
                }
                else {
                    transcriptionField.classList.add('is-hidden');
                    transcriptionCheckbox.checked = false;
                    descriptionTextarea.disabled = false;
                }
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
                    }, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
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
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
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
        cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/${workOrderId}/doGetWorkOrderAttachments`, {}, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            renderAttachments(responseJSON.attachments);
        });
    }
    document
        .querySelector('#button--addAttachment')
        ?.addEventListener('click', () => {
        showAddAttachmentModal();
    });
    loadAttachments();
})();
