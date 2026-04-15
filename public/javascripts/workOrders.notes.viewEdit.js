(() => {
    const workOrderFormElement = document.querySelector('#form--workOrder');
    const workOrderId = workOrderFormElement === null
        ? ''
        : workOrderFormElement.querySelector('#workOrder--workOrderId').value;
    let noteTypes = [];
    const notesContainerElement = document.querySelector('#container--notes');
    if (notesContainerElement === null) {
        return;
    }
    function truncateText(text, maxLength) {
        if (text.length <= maxLength) {
            return text;
        }
        return `${text.slice(0, maxLength)}…`;
    }
    function loadDataLists(dataListKeys, callback) {
        if (dataListKeys.size === 0) {
            callback(new Map());
            return;
        }
        const dataListMap = new Map();
        let loadedCount = 0;
        const totalCount = dataListKeys.size;
        for (const key of dataListKeys) {
            cityssm.postJSON(`${exports.shiftLog.urlPrefix}/dashboard/doGetDataListItems`, { dataListKey: key }, (responseJSON) => {
                dataListMap.set(key, responseJSON.items);
                loadedCount += 1;
                if (loadedCount === totalCount) {
                    callback(dataListMap);
                }
            });
        }
    }
    function renderNotes(notes) {
        const notesCountElement = document.querySelector('#notesCount');
        if (notesCountElement !== null) {
            notesCountElement.textContent = notes.length.toString();
        }
        if (notes.length === 0) {
            notesContainerElement.innerHTML = `
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
            let fieldsHTML = '';
            if (note.fields !== undefined && note.fields.length > 0) {
                fieldsHTML = `
          <div class="content mt-2">
            <table class="table is-narrow is-size-7">
              <tbody>
                ${note.fields
                    .map((field) => {
                    const prefix = field.fieldUnitPrefix && field.fieldUnitPrefix !== ''
                        ? `${cityssm.escapeHTML(field.fieldUnitPrefix)} `
                        : '';
                    const suffix = field.fieldUnitSuffix && field.fieldUnitSuffix !== ''
                        ? ` ${cityssm.escapeHTML(field.fieldUnitSuffix)}`
                        : '';
                    return `
                  <tr>
                    <th style="width: 35%;">${cityssm.escapeHTML(field.fieldLabel)}</th>
                    <td>${prefix}${cityssm.escapeHTML(field.fieldValue)}${suffix}</td>
                  </tr>
                `;
                })
                    .join('')}
              </tbody>
            </table>
          </div>
        `;
            }
            noteElement.innerHTML = `
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
              ${fieldsHTML}
            </div>
          </div>
          ${canEdit
                ? `
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
                const fieldsContainer = modalElement.querySelector('#viewWorkOrderNote--fieldsContainer');
                fieldsContainer.innerHTML = '';
                if (note.fields !== undefined && note.fields.length > 0) {
                    fieldsContainer.innerHTML = `
            <div class="content mt-4">
              <h6 class="title is-6">Additional Information</h6>
              <table class="table is-fullwidth is-striped">
                <tbody>
                  ${note.fields
                        .map((field) => {
                        const prefix = field.fieldUnitPrefix && field.fieldUnitPrefix !== ''
                            ? `${cityssm.escapeHTML(field.fieldUnitPrefix)} `
                            : '';
                        const suffix = field.fieldUnitSuffix && field.fieldUnitSuffix !== ''
                            ? ` ${cityssm.escapeHTML(field.fieldUnitSuffix)}`
                            : '';
                        return `
                    <tr>
                      <th style="width: 40%;">${cityssm.escapeHTML(field.fieldLabel)}</th>
                      <td>${prefix}${cityssm.escapeHTML(field.fieldValue)}${suffix}</td>
                    </tr>
                  `;
                    })
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
            const formData = new FormData(formElement);
            const noteData = {
                workOrderId: formData.get('workOrderId'),
                noteSequence: formData.get('noteSequence'),
                noteText: formData.get('noteText')
            };
            const fields = {};
            for (const [key, value] of formData.entries()) {
                const match = /^fields\[(?<fieldIndex>\d+)\]$/v.exec(key);
                if (match !== null && typeof value === 'string') {
                    fields[match.groups?.fieldIndex ?? ''] = value;
                }
            }
            if (Object.keys(fields).length > 0) {
                noteData.fields = fields;
            }
            cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doUpdateWorkOrderNote`, noteData, (responseJSON) => {
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
        function renderEditFieldsWithDataLists(fields, dataListMap, fieldsContainer) {
            let fieldsHTML = '';
            for (const field of fields) {
                if (field.hasDividerAbove === true) {
                    fieldsHTML += '<hr class="mt-4 mb-4" />';
                }
                const fieldName = `fields[${field.noteTypeFieldId}]`;
                const requiredAttribute = field.fieldValueRequired === true ? 'required' : '';
                const helpText = field.fieldHelpText !== undefined && field.fieldHelpText !== ''
                    ? `<p class="help">${cityssm.escapeHTML(field.fieldHelpText)}</p>`
                    : '';
                fieldsHTML += '<div class="field">';
                fieldsHTML += `<label class="label" for="editWorkOrderNote--field-${field.noteTypeFieldId}">
            ${cityssm.escapeHTML(field.fieldLabel)}
            ${field.fieldValueRequired === true ? '<span class="has-text-danger">*</span>' : ''}
          </label>`;
                switch (field.fieldInputType) {
                    case 'date': {
                        fieldsHTML += `
              <div class="control">
                <input class="input" type="date"
                  id="editWorkOrderNote--field-${field.noteTypeFieldId}"
                  name="${fieldName}"
                  value="${cityssm.escapeHTML(field.fieldValue)}"
                  ${requiredAttribute} />
              </div>
            `;
                        break;
                    }
                    case 'number': {
                        const minAttribute = field.fieldValueMin !== null && field.fieldValueMin !== undefined
                            ? `min="${field.fieldValueMin}"`
                            : '';
                        const maxAttribute = field.fieldValueMax !== null && field.fieldValueMax !== undefined
                            ? `max="${field.fieldValueMax}"`
                            : '';
                        const hasPrefix = field.fieldUnitPrefix !== undefined &&
                            field.fieldUnitPrefix !== '';
                        const hasSuffix = field.fieldUnitSuffix !== undefined &&
                            field.fieldUnitSuffix !== '';
                        if (hasPrefix || hasSuffix) {
                            fieldsHTML += '<div class="field has-addons">';
                            if (hasPrefix) {
                                fieldsHTML += `
                  <div class="control">
                    <span class="button is-static">${cityssm.escapeHTML(field.fieldUnitPrefix ?? '')}</span>
                  </div>
                `;
                            }
                            fieldsHTML += `
                <div class="control is-expanded">
                  <input class="input" type="number"
                    id="editWorkOrderNote--field-${field.noteTypeFieldId}"
                    name="${fieldName}"
                    value="${cityssm.escapeHTML(field.fieldValue)}"
                    ${minAttribute} ${maxAttribute} ${requiredAttribute} />
                </div>
              `;
                            if (hasSuffix) {
                                fieldsHTML += `
                  <div class="control">
                    <span class="button is-static">${cityssm.escapeHTML(field.fieldUnitSuffix ?? '')}</span>
                  </div>
                `;
                            }
                            fieldsHTML += '</div>';
                        }
                        else {
                            fieldsHTML += `
                <div class="control">
                  <input class="input" type="number"
                    id="editWorkOrderNote--field-${field.noteTypeFieldId}"
                    name="${fieldName}"
                    value="${cityssm.escapeHTML(field.fieldValue)}"
                    ${minAttribute} ${maxAttribute} ${requiredAttribute} />
                </div>
              `;
                        }
                        break;
                    }
                    case 'select': {
                        const dataListItems = field.dataListKey !== null && field.dataListKey !== undefined
                            ? (dataListMap.get(field.dataListKey) ?? [])
                            : [];
                        fieldsHTML += `
              <div class="control">
                <div class="select is-fullwidth">
                  <select id="editWorkOrderNote--field-${field.noteTypeFieldId}"
                    name="${fieldName}"
                    ${requiredAttribute}>
                    <option value="">-- Select --</option>
                    ${dataListItems
                            .map((item) => {
                            const selected = item.dataListItem === field.fieldValue
                                ? 'selected'
                                : '';
                            return `<option value="${cityssm.escapeHTML(item.dataListItem)}" ${selected}>${cityssm.escapeHTML(item.dataListItem)}</option>`;
                        })
                            .join('')}
                  </select>
                </div>
              </div>
            `;
                        break;
                    }
                    case 'text': {
                        const dataListItems = field.dataListKey !== null && field.dataListKey !== undefined
                            ? (dataListMap.get(field.dataListKey) ?? [])
                            : [];
                        const dataListAttribute = dataListItems.length > 0
                            ? `list="datalist-edit-${field.noteTypeFieldId}"`
                            : '';
                        const hasPrefix = field.fieldUnitPrefix !== undefined &&
                            field.fieldUnitPrefix !== '';
                        const hasSuffix = field.fieldUnitSuffix !== undefined &&
                            field.fieldUnitSuffix !== '';
                        if (hasPrefix || hasSuffix) {
                            fieldsHTML += '<div class="field has-addons">';
                            if (hasPrefix) {
                                fieldsHTML += `
                  <div class="control">
                    <span class="button is-static">${cityssm.escapeHTML(field.fieldUnitPrefix ?? '')}</span>
                  </div>
                `;
                            }
                            fieldsHTML += `
                <div class="control is-expanded">
                  <input class="input" type="text"
                    id="editWorkOrderNote--field-${field.noteTypeFieldId}"
                    name="${fieldName}"
                    value="${cityssm.escapeHTML(field.fieldValue)}"
                    ${dataListAttribute}
                    ${requiredAttribute} />
                </div>
              `;
                            if (hasSuffix) {
                                fieldsHTML += `
                  <div class="control">
                    <span class="button is-static">${cityssm.escapeHTML(field.fieldUnitSuffix ?? '')}</span>
                  </div>
                `;
                            }
                            fieldsHTML += '</div>';
                        }
                        else {
                            fieldsHTML += `
                <div class="control">
                  <input class="input" type="text"
                    id="editWorkOrderNote--field-${field.noteTypeFieldId}"
                    name="${fieldName}"
                    value="${cityssm.escapeHTML(field.fieldValue)}"
                    ${dataListAttribute}
                    ${requiredAttribute} />
                </div>
              `;
                        }
                        if (dataListItems.length > 0) {
                            fieldsHTML += `
                <datalist id="datalist-edit-${field.noteTypeFieldId}">
                  ${dataListItems
                                .map((item) => `<option value="${cityssm.escapeHTML(item.dataListItem)}"></option>`)
                                .join('')}
                </datalist>
              `;
                        }
                        break;
                    }
                    case 'textbox': {
                        fieldsHTML += `
              <div class="control">
                <textarea class="textarea" rows="3"
                  id="editWorkOrderNote--field-${field.noteTypeFieldId}"
                  name="${fieldName}"
                  ${requiredAttribute}>${cityssm.escapeHTML(field.fieldValue)}</textarea>
              </div>
            `;
                        break;
                    }
                }
                fieldsHTML += helpText;
                fieldsHTML += '</div>';
            }
            fieldsContainer.innerHTML = fieldsHTML;
        }
        cityssm.openHtmlModal('workOrders-editNote', {
            onshow(modalElement) {
                exports.shiftLog.setUnsavedChanges('modal');
                modalElement.querySelector('#editWorkOrderNote--workOrderId').value = workOrderId;
                modalElement.querySelector('#editWorkOrderNote--noteSequence').value = note.noteSequence.toString();
                modalElement.querySelector('#editWorkOrderNote--noteText').value = note.noteText;
                if (note.noteType !== null && note.noteType !== undefined) {
                    ;
                    modalElement.querySelector('#editWorkOrderNote--noteType').textContent = `"${note.noteType}"`;
                }
                const fieldsContainer = modalElement.querySelector('#editWorkOrderNote--fieldsContainer');
                if (note.noteTypeId !== null && note.noteTypeId !== undefined) {
                    const noteType = noteTypes.find((nt) => nt.noteTypeId === note.noteTypeId);
                    if (noteType !== undefined && noteType.fields.length > 0) {
                        const savedFieldValues = new Map();
                        if (note.fields !== undefined) {
                            for (const field of note.fields) {
                                savedFieldValues.set(field.noteTypeFieldId, field.fieldValue);
                            }
                        }
                        const allFields = noteType.fields.map((fieldDefinition) => ({
                            dataListKey: fieldDefinition.dataListKey,
                            fieldHelpText: fieldDefinition.fieldHelpText,
                            fieldInputType: fieldDefinition.fieldInputType,
                            fieldLabel: fieldDefinition.fieldLabel,
                            fieldUnitPrefix: fieldDefinition.fieldUnitPrefix,
                            fieldUnitSuffix: fieldDefinition.fieldUnitSuffix,
                            fieldValue: savedFieldValues.get(fieldDefinition.noteTypeFieldId) ?? '',
                            fieldValueMax: fieldDefinition.fieldValueMax,
                            fieldValueMin: fieldDefinition.fieldValueMin,
                            fieldValueRequired: fieldDefinition.fieldValueRequired,
                            hasDividerAbove: fieldDefinition.hasDividerAbove,
                            noteTypeFieldId: fieldDefinition.noteTypeFieldId,
                            orderNumber: fieldDefinition.orderNumber
                        }));
                        if (note.fields !== undefined) {
                            const noteTypeFieldIds = new Set(noteType.fields.map((f) => f.noteTypeFieldId));
                            for (const savedField of note.fields) {
                                if (!noteTypeFieldIds.has(savedField.noteTypeFieldId)) {
                                    allFields.push({
                                        dataListKey: savedField.dataListKey,
                                        fieldHelpText: savedField.fieldHelpText ??
                                            'This field has been deleted from the note type.',
                                        fieldInputType: savedField.fieldInputType,
                                        fieldLabel: savedField.fieldLabel,
                                        fieldUnitPrefix: savedField.fieldUnitPrefix,
                                        fieldUnitSuffix: savedField.fieldUnitSuffix,
                                        fieldValue: savedField.fieldValue,
                                        fieldValueMax: savedField.fieldValueMax,
                                        fieldValueMin: savedField.fieldValueMin,
                                        fieldValueRequired: false,
                                        hasDividerAbove: savedField.hasDividerAbove,
                                        noteTypeFieldId: savedField.noteTypeFieldId,
                                        orderNumber: savedField.orderNumber
                                    });
                                }
                            }
                        }
                        const dataListKeys = new Set();
                        for (const field of allFields) {
                            if (field.dataListKey !== null &&
                                field.dataListKey !== undefined) {
                                dataListKeys.add(field.dataListKey);
                            }
                        }
                        loadDataLists(dataListKeys, (dataListMap) => {
                            renderEditFieldsWithDataLists(allFields, dataListMap, fieldsContainer);
                        });
                    }
                    else if (note.fields !== undefined && note.fields.length > 0) {
                        const dataListKeys = new Set();
                        for (const field of note.fields) {
                            if (field.dataListKey !== null &&
                                field.dataListKey !== undefined) {
                                dataListKeys.add(field.dataListKey);
                            }
                        }
                        loadDataLists(dataListKeys, (dataListMap) => {
                            renderEditFieldsWithDataLists(note.fields ?? [], dataListMap, fieldsContainer);
                        });
                    }
                    else {
                        fieldsContainer.innerHTML = '';
                    }
                }
                else if (note.fields !== undefined && note.fields.length > 0) {
                    const dataListKeys = new Set();
                    for (const field of note.fields) {
                        if (field.dataListKey !== null && field.dataListKey !== undefined) {
                            dataListKeys.add(field.dataListKey);
                        }
                    }
                    loadDataLists(dataListKeys, (dataListMap) => {
                        renderEditFieldsWithDataLists(note.fields ?? [], dataListMap, fieldsContainer);
                    });
                }
                else {
                    fieldsContainer.innerHTML = '';
                }
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
            if (selectedNoteType === undefined ||
                selectedNoteType.fields.length === 0) {
                fieldsContainer.innerHTML = '';
                return;
            }
            const dataListKeys = new Set();
            for (const field of selectedNoteType.fields) {
                if (field.dataListKey !== null && field.dataListKey !== undefined) {
                    dataListKeys.add(field.dataListKey);
                }
            }
            loadDataLists(dataListKeys, (dataListMap) => {
                renderFieldsWithDataLists(selectedNoteType, dataListMap, fieldsContainer);
            });
        }
        function renderFieldsWithDataLists(selectedNoteType, dataListMap, fieldsContainer) {
            let fieldsHTML = '';
            for (const field of selectedNoteType.fields) {
                if (field.hasDividerAbove) {
                    fieldsHTML += '<hr class="mt-4 mb-4" />';
                }
                const fieldName = `fields[${field.noteTypeFieldId}]`;
                const requiredAttribute = field.fieldValueRequired ? 'required' : '';
                const helpText = field.fieldHelpText === ''
                    ? ''
                    : `<p class="help">${cityssm.escapeHTML(field.fieldHelpText)}</p>`;
                fieldsHTML += '<div class="field">';
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
                        const hasPrefix = field.fieldUnitPrefix !== '';
                        const hasSuffix = field.fieldUnitSuffix !== '';
                        if (hasPrefix || hasSuffix) {
                            fieldsHTML += '<div class="field has-addons">';
                            if (hasPrefix) {
                                fieldsHTML += `
                  <div class="control">
                    <span class="button is-static">${cityssm.escapeHTML(field.fieldUnitPrefix)}</span>
                  </div>
                `;
                            }
                            fieldsHTML += `
                <div class="control is-expanded">
                  <input class="input" type="number"
                    id="addWorkOrderNote--field-${field.noteTypeFieldId}"
                    name="${fieldName}"
                    ${minAttribute} ${maxAttribute} ${requiredAttribute} />
                </div>
              `;
                            if (hasSuffix) {
                                fieldsHTML += `
                  <div class="control">
                    <span class="button is-static">${cityssm.escapeHTML(field.fieldUnitSuffix)}</span>
                  </div>
                `;
                            }
                            fieldsHTML += '</div>';
                        }
                        else {
                            fieldsHTML += `
                <div class="control">
                  <input class="input" type="number"
                    id="addWorkOrderNote--field-${field.noteTypeFieldId}"
                    name="${fieldName}"
                    ${minAttribute} ${maxAttribute} ${requiredAttribute} />
                </div>
              `;
                        }
                        break;
                    }
                    case 'select': {
                        const dataListItems = field.dataListKey !== null && field.dataListKey !== undefined
                            ? (dataListMap.get(field.dataListKey) ?? [])
                            : [];
                        fieldsHTML += `
              <div class="control">
                <div class="select is-fullwidth">
                  <select id="addWorkOrderNote--field-${field.noteTypeFieldId}"
                    name="${fieldName}"
                    ${requiredAttribute}>
                    <option value="">-- Select --</option>
                    ${dataListItems
                            .map((item) => `<option value="${cityssm.escapeHTML(item.dataListItem)}">${cityssm.escapeHTML(item.dataListItem)}</option>`)
                            .join('')}
                  </select>
                </div>
              </div>
            `;
                        break;
                    }
                    case 'text': {
                        const dataListItems = field.dataListKey !== null && field.dataListKey !== undefined
                            ? (dataListMap.get(field.dataListKey) ?? [])
                            : [];
                        const dataListAttribute = dataListItems.length > 0
                            ? `list="datalist-${field.noteTypeFieldId}"`
                            : '';
                        const hasPrefix = field.fieldUnitPrefix !== '';
                        const hasSuffix = field.fieldUnitSuffix !== '';
                        if (hasPrefix || hasSuffix) {
                            fieldsHTML += '<div class="field has-addons">';
                            if (hasPrefix) {
                                fieldsHTML += `
                  <div class="control">
                    <span class="button is-static">${cityssm.escapeHTML(field.fieldUnitPrefix)}</span>
                  </div>
                `;
                            }
                            fieldsHTML += `
                <div class="control is-expanded">
                  <input class="input" type="text"
                    id="addWorkOrderNote--field-${field.noteTypeFieldId}"
                    name="${fieldName}"
                    ${dataListAttribute}
                    ${requiredAttribute} />
                </div>
              `;
                            if (hasSuffix) {
                                fieldsHTML += `
                  <div class="control">
                    <span class="button is-static">${cityssm.escapeHTML(field.fieldUnitSuffix)}</span>
                  </div>
                `;
                            }
                            fieldsHTML += '</div>';
                        }
                        else {
                            fieldsHTML += `
                <div class="control">
                  <input class="input" type="text"
                    id="addWorkOrderNote--field-${field.noteTypeFieldId}"
                    name="${fieldName}"
                    ${dataListAttribute}
                    ${requiredAttribute} />
                </div>
              `;
                        }
                        if (dataListItems.length > 0) {
                            fieldsHTML += `
                <datalist id="datalist-${field.noteTypeFieldId}">
                  ${dataListItems
                                .map((item) => `<option value="${cityssm.escapeHTML(item.dataListItem)}"></option>`)
                                .join('')}
                </datalist>
              `;
                        }
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
                fieldsHTML += '</div>';
            }
            fieldsContainer.innerHTML = fieldsHTML;
        }
        function doAddNote(submitEvent) {
            submitEvent.preventDefault();
            const formElement = submitEvent.currentTarget;
            const formData = new FormData(formElement);
            const noteData = {
                workOrderId: formData.get('workOrderId'),
                noteText: formData.get('noteText')
            };
            const noteTypeId = formData.get('noteTypeId');
            if (noteTypeId !== null && noteTypeId !== '') {
                noteData.noteTypeId = noteTypeId;
            }
            const fields = {};
            for (const [key, value] of formData.entries()) {
                const match = /^fields\[(?<fieldIndex>\d+)\]$/v.exec(key);
                if (match !== null && typeof value === 'string') {
                    fields[match.groups?.fieldIndex ?? ''] = value;
                }
            }
            if (Object.keys(fields).length > 0) {
                noteData.fields = fields;
            }
            cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doCreateWorkOrderNote`, noteData, (responseJSON) => {
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
                const noteTypeSelect = modalElement.querySelector('#addWorkOrderNote--noteTypeId');
                for (const noteType of noteTypes) {
                    const option = document.createElement('option');
                    option.value = noteType.noteTypeId.toString();
                    option.textContent = noteType.noteType;
                    noteTypeSelect.append(option);
                }
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
    document
        .querySelector('#button--addNote')
        ?.addEventListener('click', showAddNoteModal);
    loadNoteTypes();
    loadNotes();
})();
