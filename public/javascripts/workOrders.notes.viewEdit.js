/* eslint-disable max-lines -- complex client-side module with note type field handling */
(() => {
    const workOrderFormElement = document.querySelector('#form--workOrder');
    const workOrderId = workOrderFormElement === null
        ? ''
        : workOrderFormElement.querySelector('#workOrder--workOrderId').value;
    /*
     * Notes functionality
     */
    let noteTypes = [];
    const notesContainerElement = document.querySelector('#container--notes');
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- defensive check for null
    if (notesContainerElement === null) {
        return;
    }
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
            const noteTypeLabel = note.noteType !== null && note.noteType !== undefined
                ? `<span class="tag is-info is-light">${cityssm.escapeHTML(note.noteType)}</span>`
                : '';
            // eslint-disable-next-line no-unsanitized/property -- content is sanitized via cityssm.escapeHTML
            noteElement.innerHTML = /* html */ `
        <article class="media">
          <div class="media-content">
            <div class="content">
              <p>
                <strong>${cityssm.escapeHTML(note.recordCreate_userName)}</strong>
                <small>${cityssm.dateToString(new Date(note.recordCreate_dateTime))}</small>
                ${noteTypeLabel}
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
          </div>
          ${canEdit
                ? /* html */ `
                <div class="media-right">
                  <div class="buttons">
                    <button
                      class="button is-small edit-note"
                      data-note-sequence="${note.noteSequence}"
                      type="button"
                      title="Edit Note"
                    >
                      <span class="icon is-small"><i class="fa-solid fa-edit"></i></span>
                      <span>Edit Note</span>
                    </button>
                    <button
                      class="button is-small is-light is-danger delete-note"
                      data-note-sequence="${note.noteSequence}"
                      type="button"
                      title="Delete Note"
                    >
                      <span class="icon"><i class="fa-solid fa-trash"></i></span>
                    </button>
                  </div>
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
            notesContainerElement.append(noteElement);
        }
    }
    function showFullNoteModal(note) {
        cityssm.openHtmlModal('workOrders-viewNote', {
            onshow(modalElement) {
                ;
                modalElement.querySelector('#viewWorkOrderNote--userName').textContent = note.recordCreate_userName;
                modalElement.querySelector('#viewWorkOrderNote--dateTime').textContent = cityssm.dateToString(new Date(note.recordCreate_dateTime));
                // Show note type if present
                const noteTypeContainer = modalElement.querySelector('#viewWorkOrderNote--noteTypeContainer');
                if (note.noteType !== null && note.noteType !== undefined) {
                    ;
                    modalElement.querySelector('#viewWorkOrderNote--noteType').textContent = note.noteType;
                    noteTypeContainer.style.display = 'block';
                }
                else {
                    noteTypeContainer.style.display = 'none';
                }
                ;
                modalElement.querySelector('#viewWorkOrderNote--noteText').textContent = note.noteText;
                // Render fields if present
                const fieldsContainer = modalElement.querySelector('#viewWorkOrderNote--fieldsContainer');
                fieldsContainer.innerHTML = '';
                if (note.fields !== undefined && note.fields.length > 0) {
                    // eslint-disable-next-line no-unsanitized/property -- content is sanitized via cityssm.escapeHTML
                    fieldsContainer.innerHTML = `
            <div class="content mt-4">
              <h6 class="title is-6">Additional Information</h6>
              <table class="table is-fullwidth is-striped">
                <tbody>
                  ${note.fields
                        .map((field) => `
                    <tr>
                      <th style="width: 40%;">${cityssm.escapeHTML(field.fieldLabel)}</th>
                      <td>${cityssm.escapeHTML(field.fieldValue)}</td>
                    </tr>
                  `)
                        .join('')}
                </tbody>
              </table>
            </div>
          `;
                }
            },
            onshown(_modalElement, _closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
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
                exports.shiftLog.setUnsavedChanges('modal');
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
                exports.shiftLog.clearUnsavedChanges('modal');
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function showAddNoteModal(event) {
        event?.preventDefault();
        let closeModalFunction;
        function renderNoteTypeFields(selectedNoteTypeId) {
            const fieldsContainer = document.querySelector('#addWorkOrderNote--fieldsContainer');
            if (selectedNoteTypeId === '') {
                fieldsContainer.innerHTML = '';
                return;
            }
            const selectedNoteType = noteTypes.find((nt) => nt.noteTypeId.toString() === selectedNoteTypeId);
            if (selectedNoteType === undefined || selectedNoteType.fields.length === 0) {
                fieldsContainer.innerHTML = '';
                return;
            }
            let fieldsHTML = '';
            for (const field of selectedNoteType.fields) {
                if (field.hasDividerAbove) {
                    fieldsHTML += `<hr class="mt-4 mb-4" />`;
                }
                const fieldName = `fields[${field.noteTypeFieldId}]`;
                const requiredAttribute = field.fieldValueRequired ? 'required' : '';
                const helpText = field.fieldHelpText === ''
                    ? ''
                    : `<p class="help">${cityssm.escapeHTML(field.fieldHelpText)}</p>`;
                fieldsHTML += `<div class="field">`;
                fieldsHTML += `<label class="label" for="addWorkOrderNote--field-${field.noteTypeFieldId}">
            ${cityssm.escapeHTML(field.fieldLabel)}
            ${field.fieldValueRequired ? '<span class="has-text-danger">*</span>' : ''}
          </label>`;
                switch (field.fieldInputType) {
                    case 'date': {
                        fieldsHTML += `
              <div class="control">
                <input class="input" type="date" 
                  id="addWorkOrderNote--field-${field.noteTypeFieldId}"
                  name="${fieldName}" 
                  ${requiredAttribute} />
              </div>
            `;
                        break;
                    }
                    case 'number': {
                        const minAttribute = field.fieldValueMin === null ? '' : `min="${field.fieldValueMin}"`;
                        const maxAttribute = field.fieldValueMax === null ? '' : `max="${field.fieldValueMax}"`;
                        fieldsHTML += `
              <div class="control">
                <input class="input" type="number" 
                  id="addWorkOrderNote--field-${field.noteTypeFieldId}"
                  name="${fieldName}" 
                  ${minAttribute} ${maxAttribute} ${requiredAttribute} />
              </div>
            `;
                        break;
                    }
                    case 'select': {
                        // Select fields with data list are not yet fully implemented
                        fieldsHTML += `
              <div class="control">
                <div class="select is-fullwidth">
                  <select id="addWorkOrderNote--field-${field.noteTypeFieldId}"
                    name="${fieldName}" 
                    ${requiredAttribute}>
                    <option value="">-- Select --</option>
                  </select>
                </div>
              </div>
            `;
                        break;
                    }
                    case 'text': {
                        fieldsHTML += `
              <div class="control">
                <input class="input" type="text" 
                  id="addWorkOrderNote--field-${field.noteTypeFieldId}"
                  name="${fieldName}" 
                  ${requiredAttribute} />
              </div>
            `;
                        break;
                    }
                    case 'textbox': {
                        fieldsHTML += `
              <div class="control">
                <textarea class="textarea" rows="3"
                  id="addWorkOrderNote--field-${field.noteTypeFieldId}"
                  name="${fieldName}" 
                  ${requiredAttribute}></textarea>
              </div>
            `;
                        break;
                    }
                }
                fieldsHTML += helpText;
                fieldsHTML += `</div>`;
            }
            // eslint-disable-next-line no-unsanitized/property -- content is sanitized via cityssm.escapeHTML
            fieldsContainer.innerHTML = fieldsHTML;
        }
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
                exports.shiftLog.populateSectionAliases(modalElement);
                exports.shiftLog.setUnsavedChanges('modal');
                modalElement.querySelector('#addWorkOrderNote--workOrderId').value = workOrderId;
                // Populate note types dropdown
                const noteTypeSelect = modalElement.querySelector('#addWorkOrderNote--noteTypeId');
                for (const noteType of noteTypes) {
                    const option = document.createElement('option');
                    option.value = noteType.noteTypeId.toString();
                    option.textContent = noteType.noteType;
                    noteTypeSelect.append(option);
                }
                // Add event listener for note type change
                noteTypeSelect.addEventListener('change', () => {
                    renderNoteTypeFields(noteTypeSelect.value);
                });
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
                exports.shiftLog.clearUnsavedChanges('modal');
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
                        noteSequence,
                        workOrderId
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
        cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/${workOrderId}/doGetWorkOrderNotes`, {}, (responseJSON) => {
            renderNotes(responseJSON.notes);
        });
    }
    function loadNoteTypes() {
        cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doGetNoteTypes`, {}, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            noteTypes = responseJSON.noteTypes;
        });
    }
    // Add note button
    document
        .querySelector('#button--addNote')
        ?.addEventListener('click', showAddNoteModal);
    // Load note types and notes initially
    loadNoteTypes();
    loadNotes();
})();
