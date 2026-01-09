(() => {
    const workOrderFormElement = document.querySelector('#form--workOrder');
    const workOrderId = workOrderFormElement === null
        ? ''
        : workOrderFormElement.querySelector('#workOrder--workOrderId').value;
    /*
     * Notes functionality
     */
    const notesContainerElement = document.querySelector('#container--notes');
    if (notesContainerElement !== null) {
        function truncateText(text, maxLength) {
            if (text.length <= maxLength) {
                return text;
            }
            return `${text.slice(0, maxLength)}…`;
        }
        function renderNotes(notes) {
            // Update notes count
            const notesCountElement = document.querySelector('#notesCount');
            if (notesCountElement !== null) {
                notesCountElement.textContent = notes.length.toString();
            }
            if (notes.length === 0) {
                notesContainerElement.innerHTML = /* html */ `
          <div class="message is-info">
            <p class="message-body">No notes have been added yet.</p>
          </div>
        `;
                return;
            }
            notesContainerElement.innerHTML = '';
            for (const note of notes) {
                const noteElement = document.createElement('div');
                noteElement.className = 'box';
                const canEdit = exports.isEdit &&
                    (exports.shiftLog.userCanManageWorkOrders ||
                        note.recordCreate_userName === exports.shiftLog.userName);
                const truncatedText = truncateText(note.noteText, 200);
                const needsExpand = note.noteText.length > 200;
                // eslint-disable-next-line no-unsanitized/property
                noteElement.innerHTML = /* html */ `
          <article class="media">
            <div class="media-content">
              <div class="content">
                <p>
                  <strong>${cityssm.escapeHTML(note.recordCreate_userName)}</strong>
                  <small>${cityssm.dateToString(new Date(note.recordCreate_dateTime))}</small>
                  ${note.recordUpdate_dateTime === note.recordCreate_dateTime
                    ? ''
                    : '<small class="has-text-grey">(edited)</small>'}
                  <br />
                  <span class="note-text">${cityssm.escapeHTML(truncatedText)}</span>
                  ${needsExpand
                    ? `<a href="#" class="view-full-note" data-note-sequence="${note.noteSequence}">View Full Note</a>`
                    : ''}
                </p>
              </div>
              ${canEdit
                    ? /* html */ `
                    <div class="buttons">
                      <a class="button is-small edit-note" data-note-sequence="${note.noteSequence}">
                        <span class="icon is-small"><i class="fa-solid fa-edit"></i></span>
                        <span>Edit Note</span>
                      </a>
                    </div>
                  `
                    : ''}
            </div>
            ${canEdit
                    ? /* html */ `
                  <div class="media-right">
                    <button class="button is-small is-light is-danger delete-note" data-note-sequence="${note.noteSequence}" title="Delete Note">
                      <span class="icon"><i class="fa-solid fa-trash"></i></span>
                    </button>
                  </div>
                `
                    : ''}
          </article>
        `;
                // Add event listeners
                if (needsExpand) {
                    const viewFullLink = noteElement.querySelector('.view-full-note');
                    viewFullLink.addEventListener('click', (event) => {
                        event.preventDefault();
                        showFullNoteModal(note);
                    });
                }
                if (canEdit) {
                    const editLink = noteElement.querySelector('.edit-note');
                    editLink.addEventListener('click', (event) => {
                        event.preventDefault();
                        showEditNoteModal(note);
                    });
                    const deleteLink = noteElement.querySelector('.delete-note');
                    deleteLink.addEventListener('click', (event) => {
                        event.preventDefault();
                        deleteNote(note.noteSequence);
                    });
                }
                notesContainerElement?.append(noteElement);
            }
        }
        function showFullNoteModal(note) {
            const modalElement = document.createElement('div');
            modalElement.className = 'modal is-active';
            modalElement.innerHTML = /* html */ `
        <div class="modal-background"></div>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">Full Note</p>
            <button class="delete" aria-label="close"></button>
          </header>
          <section class="modal-card-body">
            <p><strong>${cityssm.escapeHTML(note.recordCreate_userName)}</strong></p>
            <p><small>${cityssm.dateToString(new Date(note.recordCreate_dateTime))}</small></p>
            <div class="content mt-3">
              <p style="white-space: pre-wrap;">${cityssm.escapeHTML(note.noteText)}</p>
            </div>
          </section>
          <footer class="modal-card-foot">
            <button class="button close-modal">Close</button>
          </footer>
        </div>
      `;
            document.body.append(modalElement);
            const closeButtons = modalElement.querySelectorAll('.delete, .close-modal, .modal-background');
            for (const button of closeButtons) {
                button.addEventListener('click', () => {
                    modalElement.remove();
                });
            }
        }
        function showEditNoteModal(note) {
            let closeModalFunction;
            function doUpdateNote(submitEvent) {
                submitEvent.preventDefault();
                const formElement = submitEvent.currentTarget;
                cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doUpdateWorkOrderNote`, formElement, (responseJSON) => {
                    if (responseJSON.success) {
                        closeModalFunction();
                        loadNotes();
                    }
                    else {
                        bulmaJS.alert({
                            contextualColorName: 'danger',
                            message: 'Failed to update note.'
                        });
                    }
                });
            }
            cityssm.openHtmlModal('workOrders-editNote', {
                onshow(modalElement) {
                    ;
                    modalElement.querySelector('#editWorkOrderNote--workOrderId').value = workOrderId;
                    modalElement.querySelector('#editWorkOrderNote--noteSequence').value = note.noteSequence.toString();
                    modalElement.querySelector('#editWorkOrderNote--noteText').value = note.noteText;
                },
                onshown(modalElement, _closeModalFunction) {
                    bulmaJS.toggleHtmlClipped();
                    closeModalFunction = _closeModalFunction;
                    modalElement
                        .querySelector('form')
                        ?.addEventListener('submit', doUpdateNote);
                },
                onremoved() {
                    bulmaJS.toggleHtmlClipped();
                }
            });
        }
        function showAddNoteModal(event) {
            event?.preventDefault();
            let closeModalFunction;
            function doAddNote(submitEvent) {
                submitEvent.preventDefault();
                const formElement = submitEvent.currentTarget;
                cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doCreateWorkOrderNote`, formElement, (responseJSON) => {
                    if (responseJSON.success) {
                        closeModalFunction();
                        formElement.reset();
                        loadNotes();
                    }
                    else {
                        bulmaJS.alert({
                            contextualColorName: 'danger',
                            message: 'Failed to add note.'
                        });
                    }
                });
            }
            cityssm.openHtmlModal('workOrders-addNote', {
                onshow(modalElement) {
                    ;
                    modalElement.querySelector('#addWorkOrderNote--workOrderId').value = workOrderId;
                },
                onshown(modalElement, _closeModalFunction) {
                    bulmaJS.toggleHtmlClipped();
                    closeModalFunction = _closeModalFunction;
                    modalElement
                        .querySelector('form')
                        ?.addEventListener('submit', doAddNote);
                    modalElement.querySelector('#addWorkOrderNote--noteText').focus();
                },
                onremoved() {
                    bulmaJS.toggleHtmlClipped();
                }
            });
        }
        function deleteNote(noteSequence) {
            bulmaJS.confirm({
                contextualColorName: 'danger',
                title: 'Delete Note',
                message: 'Are you sure you want to delete this note?',
                okButton: {
                    text: 'Delete',
                    callbackFunction: () => {
                        cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doDeleteWorkOrderNote`, {
                            workOrderId,
                            noteSequence
                        }, (responseJSON) => {
                            if (responseJSON.success) {
                                loadNotes();
                            }
                            else {
                                bulmaJS.alert({
                                    contextualColorName: 'danger',
                                    message: 'Failed to delete note.'
                                });
                            }
                        });
                    }
                }
            });
        }
        function loadNotes() {
            cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/${workOrderId}/doGetWorkOrderNotes`, {}, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    renderNotes(responseJSON.notes);
                }
            });
        }
        // Add note button
        document
            .querySelector('#button--addNote')
            ?.addEventListener('click', showAddNoteModal);
        // Load notes initially
        loadNotes();
    }
})();
